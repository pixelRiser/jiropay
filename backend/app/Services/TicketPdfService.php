<?php

namespace App\Services;

use App\Models\Facture;
use App\Models\PaiementJirama;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfDocument;

/**
 * Génère le PDF du ticket JIRAMA — partagé entre le téléchargement client
 * (RecuController) et l'envoi automatique par email (PaiementJiramaController).
 * Largeur commune (80mm, format ticket) — hauteur propre à chaque type, le
 * ticket carte ayant davantage de sections (quantité, taxes, jeton) donc
 * naturellement plus long que le ticket facture.
 */
class TicketPdfService
{
    public function generer(PaiementJirama $ticket, Facture $facture): PdfDocument
    {
        $estCarte = $facture->type === 'carte';
        $vue = $estCarte ? 'recus.ticket-carte' : 'recus.ticket-facture';
        $hauteur = $estCarte ? 1060 : 620;

        return Pdf::loadView($vue, ['ticket' => $ticket, 'facture' => $facture])
            ->setPaper([0, 0, 226.77, $hauteur]);
    }

    public function nomFichier(PaiementJirama $ticket): string
    {
        $reference = $ticket->numero_ticket ?: "PAI-{$ticket->paiement_id}";

        return "ticket-{$reference}.pdf";
    }
}
