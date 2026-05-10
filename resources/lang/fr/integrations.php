<?php

return [

    'page' => [
        'title' => 'Intégrations & API',
        'subtitle' => 'Connectez vos outils · Les tokens sont chiffrés de bout en bout et personnels par utilisateur',
    ],

    'counter' => [
        'connected' => 'connectés',
    ],

    'fallback_note' => [
        'label' => 'Fallback automatique',
        'message' => "Si aucun token personnel n'est configuré, le token global du fichier .env est utilisé. Les tokens personnels ont toujours la priorité.",
    ],

    'status' => [
        'expired' => 'Expiré',
        'connected' => 'Connecté',
        'env_fallback' => 'Fallback .env',
        'not_configured' => 'Non configuré',
    ],

    'usage' => [
        'label' => 'Utilisation ce mois',
    ],

    'token' => [
        'current' => 'Token actuel',
        'expires' => 'Expire :date',
        'last_used' => 'Dernière utilisation · :date',
        'replace' => 'Remplacer le token',
        'expiry_date' => "Date d'expiration",
        'expiry_optional' => '(optionnel)',
        'client_secret' => 'Client Secret',
        'copy' => 'Copier',
    ],

    'expiry_warning' => 'Ce token a expiré le :date. Veuillez le renouveler.',

    'test_result' => [
        'ok' => 'Connexion validée',
        'fail' => 'Token invalide ou service inaccessible',
    ],

    'categories' => [
        'sourcing' => 'Sourcing',
        'ai' => 'Intelligence artificielle',
        'scheduling' => 'Planification',
    ],

    'actions' => [
        'replace' => 'Remplacer',
        'connect' => 'Connecter',
        'test' => 'Tester',
        'docs' => 'Docs',
        'revoke' => 'Révoquer',
    ],
];
