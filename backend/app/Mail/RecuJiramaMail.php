<?php

namespace App\Mail;

use App\Models\Facture;
use App\Models\PaiementJirama;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Envoyé automatiquement au client dès que l'admin valide le ticket JIRAMA
 * (voir Admin\PaiementJiramaController::store — "La validation déclenche
 * l'envoi automatique d'un reçu électronique", frontend/README.md §9).
 *
 * Envoyé de façon synchrone (pas ShouldQueue) : le PDF est du contenu binaire
 * brut, or la mise en queue sérialise le job en JSON, ce qui échoue sur du
 * binaire non-UTF8 ("Malformed UTF-8 characters"). Action admin ponctuelle,
 * pas un chemin chaud — l'envoi synchrone est sans risque ici.
 */
class RecuJiramaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PaiementJirama $ticket,
        public Facture $facture,
        public string $pdfContent,
        public string $pdfFilename,
    ) {}

    public function build(): self
    {
        return $this->subject('Votre reçu JIRAMA Pay')
            ->view('emails.recu-jirama')
            ->attachData($this->pdfContent, $this->pdfFilename, [
                'mime' => 'application/pdf',
            ]);
    }
}
