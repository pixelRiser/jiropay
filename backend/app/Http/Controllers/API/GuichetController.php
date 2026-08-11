<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuichetController extends Controller
{
    /**
     * Le guichet de l'agent connecté (infos + solde de commission) — distinct
     * de Admin\GuichetController, réservé aux admins pour la liste complète.
     */
    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->guichet_id, 404, "Aucun guichet associé à ce compte.");

        return response()->json(['success' => true, 'data' => $user->guichet]);
    }

    /**
     * "Ses demandes de paiement envoyées à l'admin" (frontend/README.md §7) —
     * les paiements de ses propres clients référés, avec leur statut : en
     * attente de confirmation mobile money, confirmé mais pas encore traité
     * par l'admin (pas de ticket JIRAMA), ou déjà réglé auprès de JIRAMA.
     */
    public function mesPaiements(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->guichet_id, 404, "Aucun guichet associé à ce compte.");

        $paiements = Paiement::with(['facture', 'client.user:id,name,email', 'paiementJirama'])
            ->where('guichet_referent_id', $user->guichet_id)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json(['success' => true, 'data' => $paiements]);
    }
}
