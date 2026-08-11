<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Rappel mensuel envoyé aux clients sans paiement confirmé ce mois-ci
 * (Flux C, frontend/README.md §4) — voir RappelClientsCommand.
 */
class RappelFactureMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Client $client) {}

    public function build(): self
    {
        return $this->subject('Pensez à régler votre facture JIRAMA')
            ->view('emails.rappel-facture');
    }
}
