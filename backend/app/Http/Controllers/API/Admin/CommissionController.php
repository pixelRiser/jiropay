<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Guichet;
use Illuminate\Http\JsonResponse;

class CommissionController extends Controller
{
    /**
     * "Vue sur toutes les commissions et tous les guichets" (frontend/README.md
     * §7) — historique des commissions créditées, tous guichets confondus.
     */
    public function index(): JsonResponse
    {
        $commissions = Commission::with([
            'guichet:id,nom,lieu',
            'paiement.facture',
            'paiement.client.user:id,name,email',
        ])
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        $totalCreditee = (int) Commission::where('statut', 'creditee')->sum('montant_commission');

        $soldeParGuichet = Guichet::orderByDesc('solde_commission')
            ->get(['id', 'nom', 'lieu', 'solde_commission']);

        return response()->json([
            'success' => true,
            'data' => $commissions,
            'total_creditee' => $totalCreditee,
            'solde_par_guichet' => $soldeParGuichet,
        ]);
    }
}
