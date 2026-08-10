<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AgentController extends Controller
{
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
}
