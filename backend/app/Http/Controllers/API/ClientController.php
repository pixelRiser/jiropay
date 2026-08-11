<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Admin voit tous les clients ; un agent ne voit que les clients rattachés
     * à son propre guichet (contrôle d'accès appliqué ici, pas côté frontend).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Client::with(['user:id,name,email,phone', 'guichetReferent:id,nom,lieu']);

        if ($user->role === 'agent') {
            $query->where('guichet_referent_id', $user->guichet_id);
        }

        return response()->json(['success' => true, 'data' => $query->orderByDesc('created_at')->get()]);
    }

    /**
     * Un agent (ou un admin) enregistre un client sans mot de passe — le
     * client reçoit un email pour activer son compte (voir
     * AuthController::createClientByStaff()).
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'email'                => 'required|string|email|max:255|unique:users,email',
            'phone'                => 'required|string|max:30',
            'numero_abonne_jirama' => 'required|string|max:100',
            'adresse'              => 'nullable|string|max:255',
            // Un admin peut enregistrer un client pour n'importe quel guichet ;
            // un agent ne peut enregistrer que pour son propre guichet.
            'guichet_id' => $user->role === 'admin' ? 'required|integer|exists:guichets,id' : 'nullable',
        ], [
            'name.required'                    => 'Le nom est obligatoire.',
            'email.required'                   => "L'email est obligatoire.",
            'email.unique'                      => 'Un compte existe déjà avec cet email.',
            'phone.required'                    => 'Le téléphone est obligatoire.',
            'numero_abonne_jirama.required'     => "Le numéro d'abonné JIRAMA est obligatoire.",
        ]);

        $guichetId = $user->role === 'admin' ? $validated['guichet_id'] : $user->guichet_id;

        $newUser = app(AuthController::class)->createClientByStaff($validated, $guichetId);

        return response()->json(['success' => true, 'data' => $newUser->load('client')], 201);
    }

    /**
     * Réattribue un client à un autre guichet référent — réservé à l'admin,
     * en cas de litige (frontend/README.md §5 : "Un changement n'est possible
     * que par une intervention manuelle de l'admin"). N'affecte que les
     * paiements futurs — l'historique (paiements/commissions déjà générés)
     * garde son guichet_referent_id d'origine, copié au moment du paiement.
     */
    public function updateGuichet(Request $request, Client $client): JsonResponse
    {
        $validated = $request->validate([
            'guichet_id' => 'required|integer|exists:guichets,id',
        ], [
            'guichet_id.required' => 'Le nouveau guichet est obligatoire.',
            'guichet_id.exists' => 'Guichet introuvable.',
        ]);

        $client->update(['guichet_referent_id' => $validated['guichet_id']]);

        return response()->json(['success' => true, 'data' => $client->load('guichetReferent')]);
    }
}
