<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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
     * - 'facture' : facture postpayée — référence facture + montant + nom du
     *               titulaire inscrit dessus (pas forcément le client qui paie).
     * - 'carte'   : achat de crédit prépayé — référence client + n° compteur
     *               à recharger + montant. Le compteur rechargé n'est pas
     *               forcément celui enregistré sur le compte du client.
     */
    public function store(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $type = $request->input('type', 'facture');

        $validated = $request->validate([
            'type'               => 'required|in:facture,carte',
            'reference_facture'  => 'required|string|max:100',
            'montant_du'         => 'required|integer|min:300',
            'nom_titulaire'      => 'required_if:type,facture|nullable|string|max:255',
            'numero_compteur'    => 'required_if:type,carte|nullable|string|max:100',
        ], [
            'reference_facture.required'  => 'La référence est obligatoire.',
            'montant_du.required'         => 'Le montant est obligatoire.',
            'montant_du.min'              => 'Le montant minimum est de 300 Ar.',
            'nom_titulaire.required_if'   => 'Le nom du titulaire est obligatoire.',
            'numero_compteur.required_if' => 'Le numéro de compteur est obligatoire.',
        ]);

        $facture = $client->factures()->create([
            'type'               => $type,
            'reference_facture'  => $validated['reference_facture'],
            'nom_titulaire'      => $validated['nom_titulaire'] ?? null,
            'numero_compteur'    => $validated['numero_compteur'] ?? null,
            'montant_du'         => $validated['montant_du'],
            // Pas de "mois facturé" dans ces deux flux par référence — fixé au
            // mois courant, informatif uniquement.
            'mois_facture'       => now()->startOfMonth(),
            'statut'             => 'en_attente',
        ]);

        return response()->json(['success' => true, 'data' => $facture], 201);
    }
}
