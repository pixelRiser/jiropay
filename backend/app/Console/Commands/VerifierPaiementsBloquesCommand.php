<?php

namespace App\Console\Commands;

use App\Mail\PaiementBloqueMail;
use App\Mail\PaiementEnVerificationMail;
use App\Models\Paiement;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Filet de sécurité pour le bug de signature webhook GoalPay connu : GoalPay
 * n'expose aucun endpoint de consultation de statut ("le webhook est la
 * seule source fiable" selon leur doc), donc un paiement dont le webhook
 * échoue reste "en_attente" indéfiniment sans qu'aucune des deux parties
 * (client, admin) ne soit prévenue — risque réel que le client se sente
 * dupé si son paiement a réellement abouti chez GoalPay. Cette commande
 * détecte les paiements restés "en_attente" au-delà de la durée de vie du
 * lien GoalPay (~10 min) et alerte l'admin (à charge pour lui de vérifier
 * manuellement dans le dashboard GoalPay et de corriger via
 * Admin\PaiementController::updateStatut(), déjà en place) — une seule fois
 * par paiement (alerte_admin_envoyee_at). Le client reçoit email + notification
 * rassurants en parallèle — email indispensable ici : il vient de quitter
 * l'app pour payer chez GoalPay, il n'est pas forcément connecté à JiroPay
 * quand l'alerte se déclenche. Prévu pour tourner toutes les 5 min via cron
 * (voir scripts/run-artisan.sh).
 */
class VerifierPaiementsBloquesCommand extends Command
{
    protected $signature = 'paiements:verifier-bloques {--minutes=12 : Ancienneté minimale avant alerte}';

    protected $description = "Alerte les admins pour tout paiement resté en_attente au-delà de la durée de vie du lien GoalPay";

    public function handle(): int
    {
        $seuil = now()->subMinutes((int) $this->option('minutes'));

        $paiements = Paiement::with(['client.user', 'facture'])
            ->where('statut_mobile_money', 'en_attente')
            ->whereNull('alerte_admin_envoyee_at')
            ->where('created_at', '<=', $seuil)
            ->get();

        if ($paiements->isEmpty()) {
            $this->info('Aucun paiement bloqué à signaler.');

            return self::SUCCESS;
        }

        $admins = User::where('role', 'admin')->get();

        foreach ($paiements as $paiement) {
            try {
                Mail::to($admins->pluck('email'))->send(new PaiementBloqueMail($paiement));

                NotificationService::pourAdmins(
                    'paiement_bloque',
                    'Paiement à vérifier manuellement',
                    "{$paiement->client->user->name} — {$paiement->montant} Ar — réf. {$paiement->reference_mobile_money}",
                    '/admin/paiements',
                );

                Mail::to($paiement->client->user->email)->send(new PaiementEnVerificationMail($paiement));

                NotificationService::pour(
                    $paiement->client->user,
                    'paiement_en_verification',
                    'Votre paiement est en cours de vérification',
                    'Votre paiement met plus de temps que prévu à se confirmer — notre équipe vérifie manuellement, vous serez informé dès que possible.',
                    '/espace/factures',
                );

                $paiement->update(['alerte_admin_envoyee_at' => now()]);

                $this->line("Alerté pour paiement #{$paiement->id}");
            } catch (\Throwable $e) {
                Log::error('Échec alerte paiement bloqué', [
                    'paiement_id' => $paiement->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("{$paiements->count()} paiement(s) signalé(s).");

        return self::SUCCESS;
    }
}
