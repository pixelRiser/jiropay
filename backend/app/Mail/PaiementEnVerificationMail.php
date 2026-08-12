<?php

namespace App\Mail;

use App\Models\Paiement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Envoyé au client quand son paiement met plus de temps que prévu à se
 * confirmer (voir VerifierPaiementsBloquesCommand) — le client vient de
 * quitter l'app pour payer chez GoalPay, il n'est pas forcément encore
 * connecté à JiroPay quand l'alerte se déclenche : la notification in-app
 * seule ne suffit pas, il faut aussi l'email (même règle que pour l'admin).
 */
class PaiementEnVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Paiement $paiement) {}

    public function build(): self
    {
        return $this->subject('Votre paiement est en cours de vérification — JiroPay')
            ->view('emails.paiement-en-verification');
    }
}
