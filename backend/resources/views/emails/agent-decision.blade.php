<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Décision sur votre compte agent</title>
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
                            @if($approuve)
                                <h1 style="font-size: 18px; margin: 0 0 12px; color:#1a1a1a;">
                                    Votre compte agent a été approuvé
                                </h1>
                                <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                    Bonjour {{ $agent->name }}, votre demande de compte agent pour le guichet
                                    <strong>{{ $agent->guichet->nom ?? '—' }}</strong> a été approuvée. Vous
                                    pouvez désormais vous connecter à JiroPay avec votre email et votre mot
                                    de passe.
                                </p>
                            @else
                                <h1 style="font-size: 18px; margin: 0 0 12px; color:#1a1a1a;">
                                    Votre demande de compte agent n'a pas été retenue
                                </h1>
                                <p style="font-size: 14px; color:#444; line-height: 1.6; margin: 0 0 16px;">
                                    Bonjour {{ $agent->name }}, votre demande de compte agent pour le guichet
                                    <strong>{{ $agent->guichet->nom ?? '—' }}</strong> n'a pas été retenue.
                                    Contactez le support JiroPay pour plus d'informations.
                                </p>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
