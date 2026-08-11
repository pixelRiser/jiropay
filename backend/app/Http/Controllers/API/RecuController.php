<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecuController extends Controller
{
    /**
     * Télécharge le ticket JIRAMA PDF d'une facture payée du client connecté.
     * Le ticket n'existe que si l'admin l'a saisi manuellement après avoir
     * traité le paiement JIRAMA via TPE (voir Admin\PaiementJiramaController)
     * — il n'y a pas de génération automatique. Design différent selon
     * facture.type (facture postpayée vs carte prépayée).
     */
    public function telecharger(Request $request, Facture $facture): Response
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");
        abort_unless($facture->client_id === $client->id, 403, "Cette facture ne vous appartient pas.");

        $paiement = $facture->paiements()->where('statut_mobile_money', 'confirme')->latest()->first();
        abort_unless($paiement, 404, "Aucun paiement confirmé pour cette facture.");

        $ticket = $paiement->paiementJirama;
        abort_unless($ticket, 404, "Votre ticket est en cours de traitement par notre équipe — revenez un peu plus tard.");

        // Largeur commune (80mm, format ticket) — hauteur propre à chaque
        // type, le ticket carte ayant davantage de sections (quantité, détail
        // des taxes, jeton) donc naturellement plus long que le ticket facture.
        $estCarte = $facture->type === 'carte';
        $vue = $estCarte ? 'recus.ticket-carte' : 'recus.ticket-facture';
        $hauteur = $estCarte ? 1060 : 620;

        $pdf = Pdf::loadView($vue, ['ticket' => $ticket, 'facture' => $facture])
            ->setPaper([0, 0, 226.77, $hauteur]);

        $nomFichier = $ticket->numero_ticket ?: "PAI-{$ticket->paiement_id}";

        return $pdf->download("ticket-{$nomFichier}.pdf");
    }
}
