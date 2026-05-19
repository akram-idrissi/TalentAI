<?php

return [

    'index' => [
        'title' => "Journal d'activité",
        'subtitle' => 'Toutes les actions enregistrées dans l\'application.',

        'table' => [
            'user' => 'Utilisateur',
            'action' => 'Action',
            'description' => 'Description',
            'method' => 'Méthode',
            'ip' => 'IP',
            'date' => 'Date',
        ],

        'filters' => [
            'search_placeholder' => 'Rechercher dans les descriptions, actions…',
            'user_placeholder' => 'Filtrer par utilisateur…',
            'all_actions' => 'Toutes les actions',
            'date_from' => 'Du',
            'date_to' => 'Au',
        ],

        'actions' => [
            'filter' => 'Filtrer',
            'reset' => 'Réinitialiser',
            'view' => 'Voir le détail',
        ],

        'pagination' => [
            'summary' => '{{from}}–{{to}} sur {{total}} entrées',
            'total' => '{{total}} entrées',
            'prev' => 'Page précédente',
            'next' => 'Page suivante',
        ],

        'empty' => [
            'title' => 'Aucune entrée trouvée',
            'description' => 'Modifiez vos filtres ou revenez plus tard.',
        ],

        'auth' => [
            'authenticated' => 'Authentifié',
            'not_authenticated' => 'Non authentifié',
        ],

        'unknown_user' => 'Inconnu',

        'flash' => [
            'index_error' => 'Impossible de charger les journaux d\'activité.',
            'show_error' => 'Impossible d\'afficher ce journal.',
        ],
    ],

    'show' => [
        'title' => 'Détail du journal',
        'back' => 'Retour aux journaux',

        'sections' => [
            'action' => 'Action & Description',
            'user' => 'Utilisateur',
            'request' => 'Requête HTTP',
            'controller' => 'Contrôleur',
            'models' => 'Modèles associés',
            'properties' => 'Propriétés',
        ],

        'fields' => [
            'action' => 'Action',
            'description' => 'Description',
            'logged_at' => 'Enregistré le',
            'user' => 'Utilisateur',
            'role' => 'Rôle',
            'authenticated' => 'Authentifié',
            'http_method' => 'Méthode HTTP',
            'url' => 'URL',
            'ip_address' => 'Adresse IP',
            'controller' => 'Contrôleur',
            'controller_method' => 'Méthode',
        ],

        'yes' => 'Oui',
        'no' => 'Non',
    ],

];
