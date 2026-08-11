<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Paiement;
use App\Services\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Initie un paiement (Orange Money, Telma/Mvola via la passerelle
     * configurée) pour une facture du client connecté. Crée le paiement
     * "en_attente", crée la commande côté passerelle, puis renvoie le
     * checkout_url vers lequel le frontend redirige le client — c'est la
     * passerelle qui propose le choix de l'opérateur, pas JiroPay. La
     * confirmation arrive par webhook (PaymentWebhookController), jamais
     * par le retour navigateur.
     */
    public function initier(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $validated = $request->validate([
            'facture_id' => 'required|integer|exists:factures,id',
        ], [
            'facture_id.required' => 'La facture est obligatoire.',
            'facture_id.exists' => 'Facture introuvable.',
        ]);

        $facture = Facture::where('id', $validated['facture_id'])
            ->where('client_id', $client->id)
            ->firstOrFail();

        $dejaEnCours = $facture->paiements()
            ->whereIn('statut_mobile_money', ['en_attente', 'confirme'])
            ->exists();
        abort_if($dejaEnCours, 422, 'Un paiement est déjà en cours ou confirmé pour cette facture.');

        $paiement = Paiement::create([
            'facture_id' => $facture->id,
            'client_id' => $client->id,
            'guichet_referent_id' => $client->guichet_referent_id,
            'initiateur' => 'client',
            'montant' => $facture->montant_du,
            'statut_mobile_money' => 'en_attente',
        ]);

        $gateway = new PaymentGatewayService();
        $reference = $gateway->genererReferencePaiement($paiement->id);
        $description = $facture->type === 'carte'
            ? "Achat crédit JIRAMA — compteur {$facture->numero_compteur}"
            : "Paiement facture JIRAMA — {$facture->reference_facture}";

        $resultat = $gateway->creerCommande($facture->montant_du, $reference, $description);

        if (! $resultat['success']) {
            $paiement->update([
                'statut_mobile_money' => 'echoue',
                'erreur_gateway' => $resultat['message'],
            ]);

            return response()->json(['success' => false, 'message' => $resultat['message']], 502);
        }

        $paiement->update([
            'reference_mobile_money' => $resultat['order_reference'],
            'checkout_url' => $resultat['checkout_url'],
        ]);

        return response()->json(['success' => true, 'data' => $paiement->fresh()], 201);
    }
}
