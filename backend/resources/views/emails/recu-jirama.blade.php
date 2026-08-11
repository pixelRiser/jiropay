<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Votre reçu JIRAMA Pay</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family: Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                    <tr>
                        <td style="background:#f5821f; padding: 20px 24px;">
                            <span style="color:#fff; font-size: 18px; font-weight: bold;">JIRO PAY</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 24px;">
                            <h1 style="font-size: 18px; margin: 0 0 12px; color:#1a1a1a;">
                                Votre paiement a été traité
                            </h1>
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Bonjour {{ $ticket->nom_client }},
                            </p>
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Votre paiement JIRAMA a été confirmé et traité par notre équipe. Vous
                                trouverez votre reçu (ticket d'acquit) en pièce jointe de cet email —
                                conservez-le comme preuve de paiement.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="width:100%; background:#fafafa; border-radius: 8px; padding: 4px 0; margin: 0 0 16px;">
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#666;">Numéro de ticket</td>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ $ticket->numero_ticket ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#666;">Montant payé</td>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ number_format($ticket->a_payer, 0, ',', ' ') }} Ar</td>
                                </tr>
                            </table>
                            <p style="font-size: 12px; color:#888; line-height: 1.6; margin: 0;">
                                Pour toute question, contactez votre guichet référent ou le support JiroPay.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
