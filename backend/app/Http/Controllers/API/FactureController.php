<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    /**
     * Liste des factures du client connecté, avec leur dernier paiement —
     * alimente /espace/factures.
     */
    public function mine(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $factures = $client->factures()
            ->with(['paiements' => fn ($q) => $q->latest()])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $factures]);
    }

    /**
     * Deux flux de paiement JIRAMA, un seul endpoint (voir Jirakaiky) :
     * - 'facture' : nom du titulaire inscrit sur la facture (pas forcément le
     *               client qui paie), référence facture + montant.
     * - 'carte'   : achat de crédit prépayé — nom du titulaire, référence
     *               client + n° compteur à recharger + montant.
     */
    public function store(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $type = $request->input('type', 'facture');

        $validated = $request->validate([
            'type'               => 'required|in:facture,carte',
            'reference_facture'  => 'required|string|max:100',
            'nom_titulaire'      => 'required|string|max:255',
            'montant_du'         => 'required|integer|min:300',
            'numero_compteur'    => 'required_if:type,carte|nullable|string|max:100',
        ], [
            'reference_facture.required'  => 'La référence est obligatoire.',
            'nom_titulaire.required'      => 'Le nom du titulaire est obligatoire.',
            'montant_du.required'         => 'Le montant est obligatoire.',
            'montant_du.min'              => 'Le montant minimum est de 300 Ar.',
            'numero_compteur.required_if' => 'Le numéro de compteur est obligatoire.',
        ]);

        $facture = $client->factures()->create([
            'type'               => $type,
            'reference_facture'  => $validated['reference_facture'],
            'nom_titulaire'      => $validated['nom_titulaire'],
            'numero_compteur'    => $validated['numero_compteur'] ?? null,
            'montant_du'         => $validated['montant_du'],
            // Pas de "mois facturé" dans ces deux flux par référence — fixé au
            // mois courant, informatif uniquement.
            'mois_facture'       => now()->startOfMonth(),
            'statut'             => 'en_attente',
        ]);

        return response()->json(['success' => true, 'data' => $facture], 201);
    }

    /**
     * Modifie une facture déclarée par le client — permet de "reprendre" un
     * paiement resté bloqué (lien GoalPay expiré/abandonné) sans ressaisir
     * toutes les infos depuis zéro, tout en gardant la main pour les
     * corriger. Une facture déjà payée ne peut plus être modifiée (intégrité
     * de l'historique financier, même garde que destroy()).
     */
    public function update(Request $request, Facture $facture): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");
        abort_unless($facture->client_id === $client->id, 403, "Cette facture ne vous appartient pas.");

        $dejaPayee = $facture->paiements()->where('statut_mobile_money', 'confirme')->exists();
        abort_if($dejaPayee, 422, 'Une facture déjà payée ne peut plus être modifiée.');

        $validated = $request->validate([
            'reference_facture' => 'sometimes|string|max:100',
            'nom_titulaire'     => 'sometimes|string|max:255',
            'montant_du'        => 'sometimes|integer|min:300',
            'numero_compteur'   => $facture->type === 'carte' ? 'sometimes|string|max:100' : 'nullable|string|max:100',
        ], [
            'reference_facture.required' => 'La référence est obligatoire.',
            'nom_titulaire.required'     => 'Le nom du titulaire est obligatoire.',
            'montant_du.min'             => 'Le montant minimum est de 300 Ar.',
        ]);

        $facture->update($validated);

        return response()->json(['success' => true, 'data' => $facture->fresh()]);
    }

    /**
     * Supprime une facture du client connecté — permet de nettoyer les
     * essais abandonnés (jamais payés) dans "Mes factures". Une facture
     * avec un paiement confirmé ne peut jamais être supprimée (intégrité
     * de l'historique financier).
     */
    public function destroy(Request $request, Facture $facture): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");
        abort_unless($facture->client_id === $client->id, 403, "Cette facture ne vous appartient pas.");

        $dejaPayee = $facture->paiements()->where('statut_mobile_money', 'confirme')->exists();
        abort_if($dejaPayee, 422, 'Une facture déjà payée ne peut pas être supprimée.');

        $facture->paiements()->delete();
        $facture->delete();

        return response()->json(['success' => true]);
    }
}
