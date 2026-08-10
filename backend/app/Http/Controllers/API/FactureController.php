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
     * Déclaration d'une facture par référence — flux "Pour facture" (voir
     * Jirakaiky) : référence facture + montant + nom du titulaire (le
     * titulaire du compteur n'est pas toujours le client qui paie).
     */
    public function store(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $validated = $request->validate([
            'reference_facture' => 'required|string|max:100',
            'montant_du'         => 'required|integer|min:300',
            'nom_titulaire'      => 'required|string|max:255',
        ], [
            'reference_facture.required' => 'La référence de la facture est obligatoire.',
            'montant_du.required'        => 'Le montant est obligatoire.',
            'montant_du.min'              => 'Le montant minimum est de 300 Ar.',
            'nom_titulaire.required'      => 'Le nom du titulaire est obligatoire.',
        ]);

        $facture = $client->factures()->create([
            'reference_facture' => $validated['reference_facture'],
            'nom_titulaire'      => $validated['nom_titulaire'],
            'montant_du'         => $validated['montant_du'],
            // Pas de "mois facturé" dans ce flux par référence — fixé au mois
            // courant, informatif uniquement (la référence identifie la facture).
            'mois_facture'       => now()->startOfMonth(),
            'statut'             => 'en_attente',
        ]);

        return response()->json(['success' => true, 'data' => $facture], 201);
    }
}
