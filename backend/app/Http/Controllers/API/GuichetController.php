<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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
}
