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
    | GoalPay — passerelle de paiement unique de JiroPay (Orange Money, Telma/Mvola).
    | Le client choisit son opérateur sur la page GoalPay elle-même — l'API de
    | création de commande ne prend pas de paramètre "méthode".
    | api_token : TGPT_... (sandbox) ou TGP_... (production) — ne jamais inverser.
    */
    'goalpay' => [
        'api_url' => env('GOALPAY_API_URL', 'https://api.goalpay.pro'),
        'api_token' => env('GOALPAY_API_TOKEN', ''),
        'sandbox' => env('GOALPAY_SANDBOX', true),
        'success_url' => env('GOALPAY_SUCCESS_URL', 'https://jiropay.pixel-rise.com/paiement/succes'),
        'cancel_url' => env('GOALPAY_CANCEL_URL', 'https://jiropay.pixel-rise.com/paiement/annule'),
        'failed_url' => env('GOALPAY_FAILED_URL', 'https://jiropay.pixel-rise.com/paiement/echec'),
    ],

];
