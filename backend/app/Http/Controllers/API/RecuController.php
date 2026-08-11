<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Recu;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RecuController extends Controller
{
    /**
     * Télécharge le reçu PDF d'une facture payée du client connecté. Le reçu
     * est généré à la première demande (pas au webhook — ça reste rare et
     * pas besoin de ralentir le traitement du webhook), puis réutilisé.
     */
    public function telecharger(Request $request, Facture $facture): StreamedResponse
    {
        $client = $request->user()->client;
        abort_unless($client, 403, "Ce compte n'a pas de profil client.");
        abort_unless($facture->client_id === $client->id, 403, "Cette facture ne vous appartient pas.");

        $paiement = $facture->paiements()->where('statut_mobile_money', 'confirme')->latest()->first();
        abort_unless($paiement, 404, "Aucun paiement confirmé pour cette facture — le reçu n'est pas encore disponible.");

        $recu = Recu::firstOrCreate(
            ['paiement_id' => $paiement->id],
            [
                'numero_recu' => 'REC-'.now()->format('Ymd').'-'.str_pad((string) $paiement->id, 6, '0', STR_PAD_LEFT),
                'date_emission' => now(),
                'destinataire' => 'compte_client',
                'envoye' => false,
            ]
        );

        $pdf = Pdf::loadView('recus.facture', [
            'recu' => $recu,
            'facture' => $facture,
            'paiement' => $paiement,
        ]);

        return $pdf->download("recu-{$recu->numero_recu}.pdf");
    }
}
