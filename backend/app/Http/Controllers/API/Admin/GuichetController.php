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
}
