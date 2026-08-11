<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Reçu {{ $recu->numero_recu }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1a1a1a; font-size: 13px; }
        .header { display: flex; align-items: center; border-bottom: 3px solid #f5821f; padding-bottom: 16px; margin-bottom: 24px; }
        .header img { height: 42px; }
        .header .titre { text-align: right; flex: 1; }
        .header .titre h1 { font-size: 18px; margin: 0; color: #1a1a1a; }
        .header .titre p { margin: 2px 0 0; font-size: 11px; color: #666; }
        .numero { background: #fff4e8; border: 1px solid #f5821f; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; }
        .numero strong { color: #d96b0f; font-size: 15px; }
        table.details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.details td { padding: 8px 0; border-bottom: 1px solid #eee; vertical-align: top; }
        table.details td.label { color: #666; width: 40%; }
        table.details td.value { font-weight: bold; text-align: right; }
        .montant-box { background: #1a1a1a; color: #fff; border-radius: 8px; padding: 18px 20px; text-align: center; margin: 24px 0; }
        .montant-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #ccc; }
        .montant-box .valeur { font-size: 28px; font-weight: bold; color: #f5821f; margin-top: 4px; }
        .statut { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .statut.confirme { background: #e6f7ec; color: #1a7d3a; }
        .footer { margin-top: 30px; padding-top: 14px; border-top: 1px solid #eee; font-size: 10px; color: #888; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/jiropay-logo.png') }}" alt="JiroPay">
        <div class="titre">
            <h1>Reçu de paiement</h1>
            <p>JIRAMA Pay — paiement de facture JIRAMA</p>
        </div>
    </div>

    <div class="numero">
        Reçu n° <strong>{{ $recu->numero_recu }}</strong> — émis le {{ $recu->date_emission->format('d/m/Y à H:i') }}
    </div>

    <table class="details">
        <tr>
            <td class="label">Titulaire</td>
            <td class="value">{{ $facture->nom_titulaire ?? '—' }}</td>
        </tr>
        @if($facture->type === 'carte')
        <tr>
            <td class="label">Référence client</td>
            <td class="value">{{ $facture->reference_facture }}</td>
        </tr>
        <tr>
            <td class="label">N° compteur</td>
            <td class="value">{{ $facture->numero_compteur }}</td>
        </tr>
        @else
        <tr>
            <td class="label">Référence facture</td>
            <td class="value">{{ $facture->reference_facture }}</td>
        </tr>
        @endif
        <tr>
            <td class="label">Type</td>
            <td class="value">{{ $facture->type === 'carte' ? 'Achat crédit prépayé' : 'Paiement de facture' }}</td>
        </tr>
        <tr>
            <td class="label">Méthode de paiement</td>
            <td class="value">GoalPay (Orange Money / Telma)</td>
        </tr>
        <tr>
            <td class="label">Date du paiement</td>
            <td class="value">{{ $paiement->date_paiement?->format('d/m/Y à H:i') ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Statut</td>
            <td class="value"><span class="statut confirme">Payé</span></td>
        </tr>
    </table>

    <div class="montant-box">
        <div class="label">Montant réglé</div>
        <div class="valeur">{{ number_format($paiement->montant, 0, ',', ' ') }} Ar</div>
    </div>

    <div class="footer">
        Ce reçu confirme la réception de votre paiement par JiroPay. Le règlement effectif de votre
        facture auprès de la JIRAMA est traité séparément par notre équipe et n'est pas garanti par
        ce document seul. Pour toute question, contactez votre guichet référent ou le support JiroPay.
    </div>
</body>
</html>
