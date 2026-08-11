<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use App\Services\GoalpayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GoalpayWebhookController extends Controller
{
    /**
     * Réception des événements GoalPay (payment.success/failed/canceled/
     * expired). Pas de middleware auth — vérifié par la signature
     * x-gpay-signature (HMAC-SHA256 du corps brut, clé = token API).
     * Toujours répondre 200 rapidement pour éviter les retries GoalPay,
     * même si l'événement est ignoré (paiement introuvable, déjà traité...).
     */
    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('x-gpay-signature');

        $goalpay = new GoalpayService();
        if (! $goalpay->verifierSignatureWebhook($rawBody, $signature)) {
            Log::warning('GoalPay webhook: signature invalide', ['signature' => $signature]);

            return response()->json(['message' => 'Signature invalide'], 401);
        }

        $payload = $request->json()->all();
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? [];
        $orderReference = $data['order_reference'] ?? null;

        if (! $orderReference) {
            Log::warning('GoalPay webhook: order_reference manquant', $payload);

            return response()->json(['message' => 'order_reference manquant'], 200);
        }

        $paiement = Paiement::where('reference_mobile_money', $orderReference)->first();
        if (! $paiement) {
            Log::warning('GoalPay webhook: paiement introuvable', ['order_reference' => $orderReference]);

            return response()->json(['message' => 'Paiement introuvable'], 200);
        }

        // Idempotence : un paiement déjà confirmé/échoué n'est jamais retraité.
        if ($paiement->statut_mobile_money !== 'en_attente') {
            return response()->json(['message' => 'Déjà traité'], 200);
        }

        switch ($event) {
            case 'payment.success':
                $paiement->update([
                    'statut_mobile_money' => 'confirme',
                    'date_paiement' => now(),
                ]);
                $paiement->facture()->update(['statut' => 'paye_plateforme']);
                Log::info('GoalPay webhook: paiement confirmé', ['paiement_id' => $paiement->id]);
                break;

            case 'payment.failed':
            case 'payment.canceled':
            case 'payment.expired':
                $paiement->update([
                    'statut_mobile_money' => 'echoue',
                    'erreur_gateway' => $data['error'] ?? $event,
                ]);
                Log::info('GoalPay webhook: paiement échoué/annulé/expiré', [
                    'paiement_id' => $paiement->id,
                    'event' => $event,
                ]);
                break;

            default:
                Log::warning('GoalPay webhook: événement inconnu', ['event' => $event]);
        }

        return response()->json(['message' => 'OK'], 200);
    }
}
