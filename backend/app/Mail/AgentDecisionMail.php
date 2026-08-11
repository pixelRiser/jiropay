<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Envoyé à l'agent quand un admin approuve ou rejette sa demande (voir
 * Admin\AgentController::approve()/reject()) — "le retour de demande" du
 * couple demande/retour de demande, toujours accompagné d'une notification
 * in-app équivalente (NotificationService::pour()).
 */
class AgentDecisionMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $agent, public bool $approuve) {}

    public function build(): self
    {
        $sujet = $this->approuve
            ? 'Votre compte agent JiroPay a été approuvé'
            : 'Votre demande de compte agent JiroPay';

        return $this->subject($sujet)->view('emails.agent-decision');
    }
}
