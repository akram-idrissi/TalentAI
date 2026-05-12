<?php

return [

    'index' => [
        'title' => 'Rôles',
        'subtitle' => 'Gérez les permissions de chaque rôle au sein de votre organisation.',
        'nav' => [
            'users' => 'Gérer les utilisateurs →',
        ],
        'table' => [
            'role' => 'Rôle',
            'users' => 'Utilisateurs',
            'permissions' => 'Permissions',
            'user_count' => [
                'one' => '1 utilisateur',
                'other' => '{{count}} utilisateurs',
            ],
            'more' => '+{{count}} autres',
            'all_permissions' => 'Toutes les permissions',
            'no_permissions' => 'Aucune permission',

            'super_admin_note' => 'Accès total — toutes les permissions',
            'actions' => [
                'edit' => 'Modifier les permissions',
            ],
        ],
        'flash' => [
            'success' => 'Succès',
            'error' => 'Erreur',
        ],
    ],

    'edit_modal' => [
        'title' => 'Modifier les permissions',
        'actions' => [
            'cancel' => 'Annuler',
            'submit' => 'Enregistrer',
            'submitting' => 'Enregistrement…',
        ],
    ],

    'roles' => [
        'super_admin' => 'Super Admin',
        'admin' => 'Admin',
        'recruiter' => 'Recruteur',
        'hiring_manager' => 'Responsable RH',
        'viewer' => 'Lecteur',
    ],

    'modules' => [
        'briefs' => 'Briefs',
        'candidates' => 'Candidats',
        'users' => 'Utilisateurs',
        'roles' => 'Rôles',
        'sourcing' => 'Sourcing',
        'interviews' => 'Entretiens',
        'reports' => 'Rapports',
        'settings' => 'Paramètres',
    ],

];
