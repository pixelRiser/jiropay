<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Mail\RecuJiramaMail;
use App\Models\Paiement;
use App\Models\PaiementJirama;
use App\Models\Recu;
use App\Services\NotificationService;
use App\Services\TicketPdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaiementJiramaController extends Controller
{
    /**
     * Paiements clients confirmés (donc réellement encaissés par JiroPay) qui
     * n'ont pas encore de ticket JIRAMA saisi — l'admin les traite un par un
     * via son TPE physique puis transcrit le ticket ici.
     */
    public function enAttente(): JsonResponse
    {
        $paiements = Paiement::with(['facture', 'client.user:id,name,email'])
            ->where('statut_mobile_money', 'confirme')
            ->whereDoesntHave('paiementJirama')
            ->orderBy('date_paiement')
            ->get();

        return response()->json(['success' => true, 'data' => $paiements]);
    }

    /**
     * Historique des tickets déjà saisis (contrôle/consultation admin).
     */
    public function traites(): JsonResponse
    {
        $tickets = PaiementJirama::with(['paiement.facture', 'paiement.client.user:id,name,email', 'saisiParAdmin:id,name'])
            ->orderByDesc('date_saisie')
            ->limit(100)
            ->get();

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    /**
     * Saisie du ticket JIRAMA par l'admin — un seul formulaire, champs
     * conditionnels selon facture.type (voir PaiementJirama). Marque aussi
     * la facture comme réglée auprès de JIRAMA (paye_jirama), ce qui rend le
     * reçu téléchargeable côté client (RecuController).
     */
    public function store(Request $request, Paiement $paiement, TicketPdfService $pdfService): JsonResponse
    {
        abort_unless($paiement->statut_mobile_money === 'confirme', 422, "Ce paiement n'est pas confirmé.");
        abort_if($paiement->paiementJirama()->exists(), 422, 'Un ticket a déjà été saisi pour ce paiement.');

        $facture = $paiement->facture;
        $estCarte = $facture->type === 'carte';

        $validated = $request->validate([
            'numero_ticket' => 'nullable|string|max:50',
            'date_operation' => 'required|date',
            'nom_client' => 'required|string|max:255',

            'ref_client' => $estCarte ? 'nullable|string|max:100' : 'required|string|max:100',
            'ref_facture' => $estCarte ? 'nullable|string|max:100' : 'required|string|max:100',
            'mois_facture' => $estCarte ? 'nullable|string|max:50' : 'required|string|max:50',
            'montant_facture' => $estCarte ? 'nullable|integer|min:0' : 'required|integer|min:0',

            'installation' => $estCarte ? 'required|string|max:100' : 'nullable|string|max:100',
            'commune_code' => $estCarte ? 'required|string|max:50' : 'nullable|string|max:50',
            'compteur' => $estCarte ? 'required|string|max:100' : 'nullable|string|max:100',
            'type_prepaye' => $estCarte ? 'required|string|max:100' : 'nullable|string|max:100',
            'quantite_achetee' => 'nullable|string|max:100',
            'mont_cons' => $estCarte ? 'required|integer|min:0' : 'nullable|integer|min:0',
            'prime_fixe' => 'nullable|integer|min:0',
            'redevance' => 'nullable|integer|min:0',
            'total_jirama' => $estCarte ? 'required|integer|min:0' : 'nullable|integer|min:0',
            'taxe_comm' => 'nullable|integer|min:0',
            'sur_taxe_comm' => 'nullable|integer|min:0',
            'fne' => 'nullable|integer|min:0',
            'tva' => 'nullable|integer|min:0',
            'total_taxes' => 'nullable|integer|min:0',
            'jeton' => $estCarte ? 'required|string|max:50' : 'nullable|string|max:50',

            'a_payer' => 'required|integer|min:0',
            'methode_paiement_libelle' => 'required|string|max:50',
            'ref_transaction' => 'required|string|max:100',
            'numero_payeur' => 'required|string|max:50',
            'operateur' => 'required|string|max:50',
            'id_interne' => 'nullable|string|max:100',
            'frais_jirakaiky' => 'nullable|integer|min:0',
            'frais_operateur' => 'nullable|integer|min:0',
        ], [
            'date_operation.required' => 'La date/heure du ticket est obligatoire.',
            'nom_client.required' => 'Le nom du client est obligatoire.',
            'ref_client.required' => 'La référence client est obligatoire pour une facture.',
            'ref_facture.required' => 'La référence facture est obligatoire.',
            'mois_facture.required' => 'Le mois facturé est obligatoire.',
            'montant_facture.required' => 'Le montant de la facture est obligatoire.',
            'installation.required' => "L'installation est obligatoire pour une carte prépayée.",
            'commune_code.required' => 'Le code commune est obligatoire.',
            'compteur.required' => 'Le numéro de compteur est obligatoire.',
            'type_prepaye.required' => 'Le type de prépaiement est obligatoire.',
            'mont_cons.required' => 'Le montant consommé est obligatoire.',
            'total_jirama.required' => 'Le total JIRAMA est obligatoire.',
            'jeton.required' => 'Le jeton de recharge est obligatoire.',
            'a_payer.required' => 'Le montant payé est obligatoire.',
            'methode_paiement_libelle.required' => 'La méthode de paiement est obligatoire.',
            'ref_transaction.required' => 'La référence de transaction est obligatoire.',
            'numero_payeur.required' => 'Le numéro du payeur est obligatoire.',
            'operateur.required' => "L'opérateur est obligatoire.",
        ]);

        $ticket = $paiement->paiementJirama()->create([
            ...$validated,
            'saisi_par_admin_id' => $request->user()->id,
            'date_saisie' => now(),
            'statut_validation' => 'validee',
        ]);

        $facture->update(['statut' => 'paye_jirama']);

        // Envoi automatique du reçu par email (frontend/README.md §9 : "La
        // validation déclenche l'envoi automatique d'un reçu électronique au
        // compte du client"). Ne doit jamais faire échouer la saisie du
        // ticket elle-même — l'admin a déjà fait le principal, un souci
        // d'email ne doit pas lui faire perdre sa saisie.
        try {
            $clientEmail = $paiement->client->user->email;
            $pdf = $pdfService->generer($ticket, $facture);
            $nomFichier = $pdfService->nomFichier($ticket);

            Mail::to($clientEmail)->send(new RecuJiramaMail($ticket, $facture, $pdf->output(), $nomFichier));

            Recu::create([
                'paiement_id' => $paiement->id,
                'numero_recu' => $ticket->numero_ticket ?: "REC-{$paiement->id}",
                'date_emission' => now(),
                'destinataire' => 'compte_client',
                'envoye' => true,
            ]);

            NotificationService::pour(
                $paiement->client->user,
                'facture_reglee',
                'Votre paiement a été traité',
                'Votre paiement JIRAMA a été confirmé et votre reçu électronique est disponible.',
                '/espace/factures',
            );
        } catch (\Throwable $e) {
            Log::error('Échec envoi email reçu JIRAMA', [
                'paiement_id' => $paiement->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['success' => true, 'data' => $ticket], 201);
    }
}
