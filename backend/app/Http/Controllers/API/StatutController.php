<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatutController extends Controller
{
    /**
     * Flux "Pour facture carte" (voir Jirakaiky, écran "Status client") :
     * vérifie que la référence client + n° compteur saisis correspondent
     * bien au compte connecté, avant de permettre le paiement. Sans accès
     * direct au système JIRAMA, la vérification se fait contre le numéro
     * d'abonné déjà enregistré sur le profil du client (voir
     * clients.numero_abonne_jirama) — la référence client saisie est
     * acceptée mais n'a pas d'équivalent stocké séparément à comparer.
     */
    public function verifier(Request $request): JsonResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");

        $validated = $request->validate([
            'reference_client' => 'required|string|max:100',
            'numero_compteur'  => 'required|string|max:100',
        ], [
            'reference_client.required' => 'La référence client est obligatoire.',
            'numero_compteur.required'  => 'Le numéro de compteur est obligatoire.',
        ]);

        $correspond = trim($validated['numero_compteur']) === trim($client->numero_abonne_jirama);

        if (!$correspond) {
            return response()->json([
                'success'    => true,
                'correspond' => false,
                'message'    => "Le numéro de compteur saisi ne correspond pas à celui enregistré sur votre compte.",
            ]);
        }

        $facturesEnAttente = $client->factures()
            ->where('statut', 'en_attente')
            ->orderByDesc('created_at')
            ->get(['id', 'reference_facture', 'nom_titulaire', 'montant_du', 'created_at']);

        return response()->json([
            'success'    => true,
            'correspond' => true,
            'client'     => [
                'nom'                  => $client->user->name,
                'numero_abonne_jirama' => $client->numero_abonne_jirama,
                'adresse'              => $client->adresse,
            ],
            'factures_en_attente' => $facturesEnAttente,
        ]);
    }
}
