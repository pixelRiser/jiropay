<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    | Passerelle de paiement de JiroPay — actuellement GoalPay (Orange Money,
    | Telma/Mvola). Clé volontairement neutre (payment_gateway, pas goalpay) :
    | seul PaymentGatewayService connaît le nom du fournisseur réel.
    | Le client choisit son opérateur sur la page du fournisseur elle-même —
    | l'API de création de commande ne prend pas de paramètre "méthode".
    | api_token : TGPT_... (sandbox) ou TGP_... (production) — ne jamais inverser.
    */
    'payment_gateway' => [
        'api_url' => env('GOALPAY_API_URL', 'https://api.goalpay.pro'),
        'api_token' => env('GOALPAY_API_TOKEN', ''),
        // Secret dédié pour la signature webhook (exemple officiel GoalPay) —
        // si absent, on retombe sur api_token (comportement observé ailleurs,
        // à confirmer une fois le vrai compte marchand configuré).
        'webhook_secret' => env('GOALPAY_WEBHOOK_SECRET', ''),
        'sandbox' => env('GOALPAY_SANDBOX', true),
        'success_url' => env('GOALPAY_SUCCESS_URL', 'https://jiropay.pixel-rise.com/paiement/succes'),
        'cancel_url' => env('GOALPAY_CANCEL_URL', 'https://jiropay.pixel-rise.com/paiement/annule'),
        'failed_url' => env('GOALPAY_FAILED_URL', 'https://jiropay.pixel-rise.com/paiement/echec'),
    ],

];
