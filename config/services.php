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
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'apify' => [
        'token' => env('APIFY_TOKEN'),
    ],
    'anthropic' => [
        'key' => env('ANTHROPIC_KEY'),
    ],
    'openrouter' => [
        'key' => env('OPEN_ROUTER_KEY'),
        // Free models used for LinkedIn query generation (sourcing)
        'sourcing_models' => [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.3-70b-instruct:free',
        ],
        // Free models used for candidate AI synthesis (analysis)
        'analysis_models' => [
            'google/gemini-2.0-flash-exp:free',
            'deepseek/deepseek-chat-v3-0324:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'qwen/qwen3-14b:free',
            'mistralai/mistral-7b-instruct:free',
            'meta-llama/llama-3.1-8b-instruct:free',
        ],
    ],
    'groq' => [
        'key' => env('GROQ_API_KEY'),
    ],
    'assemblyai' => [
        'key' => env('ASSEMBLYAI_API_KEY'),
        'webhook_secret' => env('ASSEMBLYAI_WEBHOOK_SECRET'),
    ],
    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
    ],

];
