<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Passerelle de paiement de JiroPay — actuellement branchée sur GoalPay
 * (Orange Money, Telma/Mvola). Nom volontairement neutre : si le fournisseur
 * change un jour, seule cette classe (et sa config `services.payment_gateway`)
 * doit être remplacée — le reste de l'application ne connaît que ce contrat
 * (creerCommande / verifierSignatureWebhook), jamais le nom "GoalPay".
 *
 * Le client choisit son opérateur sur la page de paiement du fournisseur
 * elle-même — l'API de création de commande ne prend pas de paramètre
 * "méthode".
 *
 * Sécurité webhook : le header x-gpay-signature est un HMAC-SHA256 du corps
 * brut de la requête, signé avec GOALPAY_WEBHOOK_SECRET (exemple officiel
 * GoalPay). Si ce secret n'est pas configuré, on retombe sur le token API —
 * comportement observé sur une intégration GoalPay antérieure, à confirmer
 * une fois le vrai compte marchand jiropay créé.
 */
class PaymentGatewayService
{
    private string $apiUrl;
    private string $apiToken;
    private string $webhookSecret;
    private bool $sandbox;

    private string $successUrl;
    private string $cancelUrl;
    private string $failedUrl;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('services.payment_gateway.api_url', 'https://api.goalpay.pro'), '/');
        $this->apiToken = config('services.payment_gateway.api_token', '');
        $this->webhookSecret = config('services.payment_gateway.webhook_secret', '') ?: $this->apiToken;
        $this->sandbox = (bool) config('services.payment_gateway.sandbox', true);
        $this->successUrl = config('services.payment_gateway.success_url');
        $this->cancelUrl = config('services.payment_gateway.cancel_url');
        $this->failedUrl = config('services.payment_gateway.failed_url');
    }

    /**
     * Endpoint de création de commande selon le mode.
     * Sandbox : /api/sandbox/payement/service
     * Production : /api/payement/service
     */
    private function paymentEndpoint(): string
    {
        return $this->sandbox
            ? $this->apiUrl.'/api/sandbox/payement/service'
            : $this->apiUrl.'/api/payement/service';
    }

    /**
     * Crée une commande GoalPay et retourne le checkout_url vers lequel
     * rediriger le client.
     *
     * @param  int  $montant  Montant en Ariary
     * @param  string  $reference  Référence unique JiroPay (ex: PAI-000123)
     * @param  string  $description  Description affichée sur la page GoalPay
     */
    public function creerCommande(int $montant, string $reference, string $description): array
    {
        if (empty($this->apiToken)) {
            Log::warning('GoalPay: token API non configuré — paiement impossible', ['reference' => $reference]);

            return [
                'success' => false,
                'message' => "La passerelle de paiement n'est pas encore configurée.",
            ];
        }

        $payload = [
            'description' => $description,
            'access' => $this->apiToken,
            'reference' => $reference,
            'amount' => $montant,
            'currency' => 'Ar',
            'metadata' => [
                ['label' => $description, 'unit_price' => $montant, 'quantity' => 1],
            ],
            'success_url' => $this->successUrl,
            'cancel_url' => $this->cancelUrl,
            'failed_url' => $this->failedUrl,
        ];

        try {
            $response = Http::timeout(15)->post($this->paymentEndpoint(), $payload);

            if (! $response->successful()) {
                Log::error('GoalPay API error', [
                    'reference' => $reference,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Erreur GoalPay ('.$response->status().')',
                ];
            }

            $data = $response->json('data') ?? $response->json();

            Log::info('GoalPay commande créée', [
                'reference' => $reference,
                'order_reference' => $data['order_reference'] ?? null,
                'montant' => $montant,
                'sandbox' => $this->sandbox,
            ]);

            return [
                'success' => true,
                'checkout_url' => $data['checkout_url'],
                'order_reference' => $data['order_reference'],
                'expires_in' => $data['expires_in_minutes'] ?? 10,
            ];
        } catch (\Throwable $e) {
            Log::error('GoalPay API exception', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Impossible de contacter GoalPay.',
            ];
        }
    }

    /**
     * Vérifie la signature HMAC-SHA256 du webhook GoalPay (header x-gpay-signature).
     */
    public function verifierSignatureWebhook(string $rawBody, ?string $signature): bool
    {
        if (empty($this->webhookSecret) || empty($signature)) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $this->webhookSecret);

        return hash_equals($expected, $signature);
    }

    public function genererReferencePaiement(int $paiementId): string
    {
        return 'PAI-'.now()->format('Ymd').'-'.str_pad((string) $paiementId, 6, '0', STR_PAD_LEFT).'-'.strtoupper(Str::random(4));
    }
}
