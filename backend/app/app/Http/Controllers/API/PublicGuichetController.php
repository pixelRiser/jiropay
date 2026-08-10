<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Guichet;
use Illuminate\Http\JsonResponse;

class PublicGuichetController extends Controller
{
    /**
     * Liste publique des guichets actifs — utilisée par le sélecteur "guichet
     * référent" / "mon guichet" du formulaire d'inscription (client et agent).
     */
    public function index(): JsonResponse
    {
        $guichets = Guichet::where('statut', 'actif')
            ->orderBy('nom')
            ->get(['id', 'nom', 'lieu']);

        return response()->json(['success' => true, 'data' => $guichets]);
    }
}
