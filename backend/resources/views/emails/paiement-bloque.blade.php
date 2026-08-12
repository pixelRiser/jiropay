<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Paiement à vérifier manuellement</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family: Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee;">
                    <tr>
                        <td style="background:#c0392b; padding: 20px 24px;">
                            <span style="color:#fff; font-size: 18px; font-weight: bold;">⚠️ JIRO PAY — Vérification requise</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 24px;">
                            <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                Ce paiement est resté "en attente" plus longtemps que la durée de vie du
                                lien GoalPay (~10 minutes) — le webhook de confirmation n'a probablement
                                pas été reçu (bug connu de signature côté GoalPay). Vérifiez manuellement
                                dans votre dashboard GoalPay si ce paiement a réellement abouti, puis
                                corrigez le statut depuis <strong>/admin/paiements</strong> si besoin.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="width:100%; background:#fafafa; border-radius: 8px; padding: 4px 0; margin: 0 0 16px;">
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#666;">Client</td>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ $paiement->client->user->name }} ({{ $paiement->client->user->email }})</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#666;">Montant</td>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ number_format($paiement->montant, 0, ',', ' ') }} Ar</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#666;">Référence GoalPay</td>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ $paiement->reference_mobile_money ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#666;">Créé le</td>
                                    <td style="padding: 10px 16px; font-size: 13px; color:#1a1a1a; font-weight: bold; text-align:right;">{{ $paiement->created_at->format('d/m/Y H:i') }}</td>
                                </tr>
                            </table>
                            <p style="font-size: 12px; color:#888; line-height: 1.6; margin: 0;">
                                Cette alerte n'est envoyée qu'une seule fois par paiement.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
