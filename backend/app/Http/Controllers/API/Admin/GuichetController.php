<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guichet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuichetController extends Controller
{
    public function index(): JsonResponse
    {
        $guichets = Guichet::withCount('clients')->orderBy('nom')->get();

        return response()->json(['success' => true, 'data' => $guichets]);
    }

    /**
     * Détail d'un guichet — agents rattachés, clients récents, commissions
     * récentes. Distinct de index() qui ne sert que la liste.
     */
    public function show(Guichet $guichet): JsonResponse
    {
        $guichet->loadCount(['clients', 'commissions']);
        $guichet->load([
            'agents:id,name,email,phone,status,guichet_id',
            'clients' => fn ($q) => $q->with('user:id,name,email')->latest()->limit(10),
            'commissions' => fn ($q) => $q->with([
                'paiement.facture',
                'paiement.client.user:id,name,email',
            ])->latest()->limit(10),
        ]);

        return response()->json(['success' => true, 'data' => $guichet]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'                        => 'required|string|max:255',
            'lieu'                       => 'required|string|max:255',
            'zone'                       => 'required|in:ville,hors_ville',
            'statut'                     => 'nullable|in:actif,inactif',
            'montant_frais_defaut'       => 'required|integer|min:0',
            'montant_commission_defaut'  => 'required|integer|min:0',
        ], [
            'nom.required'  => 'Le nom est obligatoire.',
            'lieu.required' => 'Le lieu est obligatoire.',
            'zone.required' => 'La zone est obligatoire.',
        ]);

        $guichet = Guichet::create($validated);

        return response()->json(['success' => true, 'data' => $guichet], 201);
    }

    public function update(Request $request, Guichet $guichet): JsonResponse
    {
        $validated = $request->validate([
            'nom'                       => 'sometimes|string|max:255',
            'lieu'                      => 'sometimes|string|max:255',
            'zone'                      => 'sometimes|in:ville,hors_ville',
            'statut'                    => 'sometimes|in:actif,inactif',
            'montant_frais_defaut'      => 'sometimes|integer|min:0',
            'montant_commission_defaut' => 'sometimes|integer|min:0',
        ]);

        $guichet->update($validated);

        return response()->json(['success' => true, 'data' => $guichet]);
    }

    /**
     * Supprime un guichet — uniquement s'il n'a jamais eu de client, paiement,
     * commission ou agent rattaché (contrainte FK RESTRICT en base pour
     * clients/paiements/commissions, mais on renvoie un message clair plutôt
     * qu'une erreur SQL brute ; les agents ont un FK nullOnDelete donc ne
     * bloqueraient pas la suppression en base — on le bloque quand même côté
     * appli pour ne jamais orpheliner un compte agent silencieusement). Un
     * guichet déjà utilisé doit être désactivé (statut=inactif), jamais
     * supprimé — ça casserait l'historique des clients/paiements qui le
     * référencent.
     */
    public function destroy(Guichet $guichet): JsonResponse
    {
        $guichet->loadCount(['clients', 'commissions', 'agents']);
        $aDesPaiements = $guichet->paiements()->exists();

        abort_if(
            $guichet->clients_count > 0 || $guichet->commissions_count > 0 || $guichet->agents_count > 0 || $aDesPaiements,
            422,
            'Ce guichet a des clients, agents, paiements ou commissions rattachés — impossible de le supprimer. Désactivez-le plutôt (statut inactif).'
        );

        $guichet->delete();

        return response()->json(['success' => true]);
    }
}
