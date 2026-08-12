<?php

namespace App\Mail;

use App\Models\Paiement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Envoyé à tous les admins quand un paiement reste "en_attente" au-delà du
 * délai d'expiration du lien GoalPay (~10 min) — GoalPay n'expose aucun
 * endpoint de consultation de statut (doc : "le webhook est la seule source
 * fiable"), donc c'est le seul filet de sécurité tant que le bug de
 * signature webhook n'est pas résolu de leur côté. Voir
 * VerifierPaiementsBloquesCommand.
 */
class PaiementBloqueMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Paiement $paiement) {}

    public function build(): self
    {
        return $this->subject('⚠️ Paiement à vérifier manuellement — JiroPay')
            ->view('emails.paiement-bloque');
    }
}
