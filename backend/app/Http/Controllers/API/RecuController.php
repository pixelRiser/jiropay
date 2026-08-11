<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Services\TicketPdfService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RecuController extends Controller
{
    /**
     * Télécharge le ticket JIRAMA PDF d'une facture payée du client connecté.
     * Le ticket n'existe que si l'admin l'a saisi manuellement après avoir
     * traité le paiement JIRAMA via TPE (voir Admin\PaiementJiramaController)
     * — il n'y a pas de génération automatique (le client le reçoit aussi
     * par email à ce moment-là, ce téléchargement est un accès de secours).
     */
    public function telecharger(Request $request, Facture $facture, TicketPdfService $pdfService): Response
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");
        abort_unless($facture->client_id === $client->id, 403, "Cette facture ne vous appartient pas.");

        $paiement = $facture->paiements()->where('statut_mobile_money', 'confirme')->latest()->first();
        abort_unless($paiement, 404, "Aucun paiement confirmé pour cette facture.");

        $ticket = $paiement->paiementJirama;
        abort_unless($ticket, 404, "Votre ticket est en cours de traitement par notre équipe — revenez un peu plus tard.");

        $pdf = $pdfService->generer($ticket, $facture);

        return $pdf->download($pdfService->nomFichier($ticket));
    }
}
