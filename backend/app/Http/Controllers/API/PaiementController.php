<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Initie un paiement mobile money pour une facture du client connecté.
     * Aucune API Orange Money/Mvola/Airtel Money n'est encore branchée — le
     * paiement est enregistré "en_attente" (voir §6 du cahier des charges :
     * un paiement mobile money peut rester en attente un moment avant
     * confirmation). La confirmation automatique arrive avec l'intégration
     * des API opérateurs, phase suivante.
     */
    public function initier(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $validated = $request->validate([
            'facture_id' => 'required|integer|exists:factures,id',
            'methode'    => 'required|in:orange_money,mvola,airtel_money',
        ], [
            'facture_id.required' => 'La facture est obligatoire.',
            'facture_id.exists'   => 'Facture introuvable.',
            'methode.required'    => 'La méthode de paiement est obligatoire.',
            'methode.in'          => 'Méthode de paiement invalide.',
        ]);

        $facture = Facture::where('id', $validated['facture_id'])
            ->where('client_id', $client->id)
            ->firstOrFail();

        $dejaEnCours = $facture->paiements()
            ->whereIn('statut_mobile_money', ['en_attente', 'confirme'])
            ->exists();
        abort_if($dejaEnCours, 422, 'Un paiement est déjà en cours ou confirmé pour cette facture.');

        $paiement = Paiement::create([
            'facture_id'             => $facture->id,
            'client_id'              => $client->id,
            'guichet_referent_id'    => $client->guichet_referent_id,
            'initiateur'             => 'client',
            'methode'                => $validated['methode'],
            'montant'                => $facture->montant_du,
            'statut_mobile_money'    => 'en_attente',
        ]);

        return response()->json(['success' => true, 'data' => $paiement], 201);
    }
}
