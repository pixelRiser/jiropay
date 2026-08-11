<?php

namespace App\Console\Commands;

use App\Mail\RappelFactureMail;
use App\Models\Client;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Flux C (frontend/README.md §4) : "Chaque mois, la plateforme identifie les
 * clients sans paiement enregistré pour le mois courant" et les relance par
 * email. Prévu pour tourner une fois par mois via cron (voir
 * scripts/run-artisan.sh).
 */
class RappelClientsCommand extends Command
{
    protected $signature = 'clients:rappel-mensuel {--dry-run : Affiche la liste sans envoyer d\'emails}';

    protected $description = "Relance par email les clients sans paiement confirmé ce mois-ci";

    public function handle(): int
    {
        $debutMois = now()->startOfMonth();

        $clients = Client::with('user:id,name,email')
            ->whereDoesntHave('paiements', function ($query) use ($debutMois) {
                $query->where('statut_mobile_money', 'confirme')
                    ->where('date_paiement', '>=', $debutMois);
            })
            ->get();

        $this->info("{$clients->count()} client(s) sans paiement confirmé ce mois-ci.");

        if ($this->option('dry-run')) {
            foreach ($clients as $client) {
                $this->line("- {$client->user->name} ({$client->user->email})");
            }

            return self::SUCCESS;
        }

        foreach ($clients as $client) {
            Mail::to($client->user->email)->send(new RappelFactureMail($client));

            try {
                NotificationService::pour(
                    $client->user,
                    'rappel_facture',
                    'Pensez à régler votre facture JIRAMA',
                    "Nous n'avons enregistré aucun paiement confirmé ce mois-ci sur votre compte.",
                    '/espace/payer-facture',
                );
            } catch (\Throwable $e) {
                Log::error('Échec notification rappel mensuel', [
                    'client_id' => $client->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Rappels envoyés.");

        return self::SUCCESS;
    }
}
