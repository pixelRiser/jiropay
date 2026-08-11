<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Rappel — facture JIRAMA</title>
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
                                N'oubliez pas votre facture JIRAMA
                            </h1>
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Bonjour {{ $client->user->name }},
                            </p>
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Nous n'avons pas encore reçu de paiement de votre part ce mois-ci.
                                Réglez votre facture JIRAMA ou rechargez votre compteur prépayé en
                                quelques instants, par Orange Money ou Telma, directement depuis
                                votre espace JiroPay.
                            </p>
                            <p style="font-size: 12px; color:#888; line-height: 1.6; margin: 16px 0 0;">
                                Si vous avez déjà réglé votre facture directement auprès de JIRAMA
                                (hors JiroPay), vous pouvez ignorer ce message.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
