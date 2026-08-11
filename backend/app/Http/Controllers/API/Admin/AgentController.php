<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    /**
     * Tous les agents (tous statuts confondus) — page CRUD complète, distincte
     * de pending() qui reste utilisée pour le badge "en attente" ailleurs.
     */
    public function index(): JsonResponse
    {
        $agents = User::with('guichet:id,nom,lieu')
            ->where('role', 'agent')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'phone', 'guichet_id', 'status', 'created_at']);

        return response()->json(['success' => true, 'data' => $agents]);
    }

    /**
     * Agents en attente de validation (inscrits eux-mêmes via /api/register,
     * voir AuthController::register — pas de création directe côté admin).
     */
    public function pending(): JsonResponse
    {
        $agents = User::with('guichet:id,nom,lieu')
            ->where('role', 'agent')
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->get(['id', 'name', 'email', 'phone', 'guichet_id', 'created_at']);

        return response()->json(['success' => true, 'data' => $agents]);
    }

    public function show(User $agent): JsonResponse
    {
        abort_unless($agent->role === 'agent', 404);

        $agent->load('guichet:id,nom,lieu,zone,solde_commission');

        return response()->json(['success' => true, 'data' => $agent]);
    }

    /**
     * Modifie les infos d'un agent (identité + rattachement guichet + statut).
     * Changer le guichet ici a un effet immédiat sur les clients qu'il pourra
     * gérer (ClientController::index() scope sur guichet_id) — contrairement
     * au client, il n'y a pas d'historique figé à préserver pour un agent.
     */
    public function update(Request $request, User $agent): JsonResponse
    {
        abort_unless($agent->role === 'agent', 404);

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'email'      => 'sometimes|string|email|max:255|unique:users,email,' . $agent->id,
            'phone'      => 'sometimes|string|max:30',
            'guichet_id' => 'sometimes|integer|exists:guichets,id',
            'status'     => 'sometimes|in:pending,approved,rejected',
        ], [
            'email.unique' => 'Un compte existe déjà avec cet email.',
        ]);

        $agent->update($validated);

        return response()->json(['success' => true, 'data' => $agent->load('guichet:id,nom,lieu')]);
    }

    public function approve(User $user): JsonResponse
    {
        abort_unless($user->role === 'agent', 422, "Cet utilisateur n'est pas un agent.");

        $user->update(['status' => 'approved']);

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function reject(User $user): JsonResponse
    {
        abort_unless($user->role === 'agent', 422, "Cet utilisateur n'est pas un agent.");

        $user->update(['status' => 'rejected']);

        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * Supprime un compte agent. Aucune table métier ne référence users.id de
     * façon bloquante pour un agent (paiements_jirama.saisi_par_admin_id est
     * toujours un admin, jamais un agent — voir PaiementJiramaController) —
     * mais on garde un filet QueryException par prudence plutôt que de
     * supposer que ça restera toujours vrai.
     */
    public function destroy(User $agent): JsonResponse
    {
        abort_unless($agent->role === 'agent', 404);

        try {
            $agent->delete();
        } catch (QueryException $e) {
            abort(422, "Cet agent est encore référencé ailleurs — impossible de le supprimer.");
        }

        return response()->json(['success' => true]);
    }
}
