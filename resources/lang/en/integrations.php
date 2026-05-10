<?php

return [

    'page' => [
        'title' => 'Integrations & API',
        'subtitle' => 'Connect your tools · Tokens are end to end encrypted and personal per user',
    ],

    'counter' => [
        'connected' => 'connected',
    ],

    'fallback_note' => [
        'label' => 'Automatic fallback',
        'message' => 'If no personal token is configured, the global token from the .env file is used. Personal tokens always take priority.',
    ],

    'status' => [
        'expired' => 'Expired',
        'connected' => 'Connected',
        'env_fallback' => '.env Fallback',
        'not_configured' => 'Not configured',
    ],

    'usage' => [
        'label' => 'Usage this month',
    ],

    'token' => [
        'current' => 'Current token',
        'expires' => 'Expires :date',
        'last_used' => 'Last used · :date',
        'replace' => 'Replace token',
        'expiry_date' => 'Expiry date',
        'expiry_optional' => '(optional)',
        'client_secret' => 'Client Secret',
        'copy' => 'Copy',
    ],

    'expiry_warning' => 'This token expired on :date. Please renew it.',

    'test_result' => [
        'ok' => 'Connection validated',
        'fail' => 'Invalid token or service unreachable',
    ],

    'categories' => [
        'sourcing' => 'Sourcing',
        'ai' => 'Artificial Intelligence',
        'scheduling' => 'Scheduling',
    ],

    'actions' => [
        'replace' => 'Replace',
        'connect' => 'Connect',
        'test' => 'Test',
        'docs' => 'Docs',
        'revoke' => 'Revoke',
    ],
];
