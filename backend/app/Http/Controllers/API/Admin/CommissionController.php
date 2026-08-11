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

    public function show(Commission $commission): JsonResponse
    {
        $commission->load([
            'guichet',
            'paiement.facture',
            'paiement.client.user:id,name,email,phone',
        ]);

        return response()->json(['success' => true, 'data' => $commission]);
    }

    /**
     * Marque une commission comme reversée au guichet (hors plateforme —
     * aucun virement automatique, juste la traçabilité du grand livre) et
     * décrémente le solde non reversé du guichet d'autant. Pas de
     * suppression possible sur une commission — c'est une écriture de grand
     * livre immuable, seul son statut évolue (même philosophie que les
     * reversements pixel-rise : jamais automatique, toujours une action
     * délibérée et traçable).
     */
    public function reverser(Commission $commission): JsonResponse
    {
        abort_unless($commission->statut === 'creditee', 422, 'Cette commission est déjà reversée.');

        $commission->update(['statut' => 'reversee']);
        $commission->guichet()->decrement('solde_commission', $commission->montant_commission);

        return response()->json(['success' => true, 'data' => $commission->fresh('guichet')]);
    }
}
