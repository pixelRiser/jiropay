<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Votre paiement est en cours de vérification</title>
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
                                Votre paiement est en cours de vérification
                            </h1>
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Bonjour {{ $paiement->client->user->name }},
                            </p>
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Votre paiement met un peu plus de temps que prévu à se confirmer
                                automatiquement. Pas d'inquiétude — notre équipe vérifie manuellement
                                votre transaction et vous confirmera dès que possible.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="width:100%; background:#fafafa; border-radius: 8px; padding: 4px 0; margin: 0 0 16px;">
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#666;">Montant</td>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ number_format($paiement->montant, 0, ',', ' ') }} Ar</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#666;">Référence</td>
                                    <td style="padding: 12px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ $paiement->reference_mobile_money ?? '—' }}</td>
                                </tr>
                            </table>
                            <p style="font-size: 12px; color:#888; line-height: 1.6; margin: 0;">
                                Vous pouvez suivre l'état de votre facture à tout moment dans "Mes factures" sur votre espace JiroPay.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
