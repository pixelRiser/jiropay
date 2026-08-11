<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Vue CRUD complète sur les paiements — distincte de
     * PaiementJiramaController qui ne montre que ceux en attente de ticket.
     * Utile notamment pour retrouver un paiement resté bloqué "en_attente"
     * suite à un souci de webhook passerelle (cas déjà rencontré en prod).
     */
    public function index(): JsonResponse
    {
        $paiements = Paiement::with([
            'facture',
            'client.user:id,name,email',
            'guichetReferent:id,nom,lieu',
            'paiementJirama:id,paiement_id,date_saisie',
            'commission:id,paiement_id,montant_commission',
        ])
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json(['success' => true, 'data' => $paiements]);
    }

    public function show(Paiement $paiement): JsonResponse
    {
        $paiement->load([
            'facture',
            'client.user:id,name,email,phone',
            'guichetReferent',
            'paiementJirama',
            'commission',
        ]);

        return response()->json(['success' => true, 'data' => $paiement]);
    }

    /**
     * Correction manuelle du statut mobile money — réservé aux paiements
     * encore "en_attente" (ex : webhook passerelle jamais reçu ou rejeté par
     * erreur signature, cas déjà rencontré en prod). Reproduit exactement les
     * effets de bord du webhook (PaymentWebhookController::handle()) pour
     * rester cohérent : facture réglée + commission créditée + solde guichet
     * incrémenté. Un paiement déjà confirmé/échoué est un état final —
     * jamais modifiable ici, pour ne jamais corrompre une commission déjà
     * créditée ou un ticket déjà saisi.
     */
    public function updateStatut(Request $request, Paiement $paiement): JsonResponse
    {
        abort_unless(
            $paiement->statut_mobile_money === 'en_attente',
            422,
            "Ce paiement est déjà dans un état final (confirmé ou échoué) — non modifiable."
        );

        $validated = $request->validate([
            'statut_mobile_money' => 'required|in:confirme,echoue',
        ], [
            'statut_mobile_money.required' => 'Le nouveau statut est obligatoire.',
        ]);

        if ($validated['statut_mobile_money'] === 'confirme') {
            $paiement->update(['statut_mobile_money' => 'confirme', 'date_paiement' => now()]);
            $paiement->facture()->update(['statut' => 'paye_plateforme']);

            if (! $paiement->commission()->exists()) {
                Commission::create([
                    'paiement_id' => $paiement->id,
                    'guichet_id' => $paiement->guichet_referent_id,
                    'montant_facture' => $paiement->facture->montant_du,
                    'montant_frais' => $paiement->montant_frais,
                    'part_plateforme' => $paiement->montant_frais - $paiement->montant_commission,
                    'montant_commission' => $paiement->montant_commission,
                    'statut' => 'creditee',
                ]);
                $paiement->guichetReferent()->increment('solde_commission', $paiement->montant_commission);
            }
        } else {
            $paiement->update([
                'statut_mobile_money' => 'echoue',
                'erreur_gateway' => 'Correction manuelle admin',
            ]);
        }

        return response()->json(['success' => true, 'data' => $paiement->fresh(['facture', 'commission'])]);
    }

    /**
     * Supprime un paiement — uniquement s'il n'a jamais généré de commission
     * ni de ticket JIRAMA (un paiement encore en_attente ou échoué, ex :
     * tentative de checkout abandonnée). Un paiement confirmé avec commission
     * créditée fait partie du grand livre financier — jamais supprimable,
     * seule la correction de statut ci-dessus ou une commission "reversée"
     * (CommissionController::reverser()) peuvent y toucher.
     */
    public function destroy(Paiement $paiement): JsonResponse
    {
        abort_if(
            $paiement->commission()->exists() || $paiement->paiementJirama()->exists(),
            422,
            'Ce paiement a une commission ou un ticket JIRAMA rattaché — impossible de le supprimer.'
        );

        $paiement->delete();

        return response()->json(['success' => true]);
    }
}
