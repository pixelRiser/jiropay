<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Envoyé à chaque admin quand un agent s'inscrit et attend une validation
 * (voir AuthController::register()) — "la demande" du couple demande/retour
 * de demande, toujours accompagnée d'une notification in-app équivalente
 * (NotificationService::pourAdmins()).
 */
class AgentRegisteredMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $agent) {}

    public function build(): self
    {
        return $this->subject("Nouvelle demande d'agent — {$this->agent->name}")
            ->view('emails.agent-registered');
    }
}
