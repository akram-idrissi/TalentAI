<?php

return [

    'index' => [
        'title' => 'Utilisateurs',
        'subtitle_one' => '1 utilisateur · Attribuez des rôles pour contrôler les accès.',
        'subtitle_other' => '{{count}} utilisateurs · Attribuez des rôles pour contrôler les accès.',
        'nav' => [
            'roles' => 'Rôles',
        ],
        'actions' => [
            'create' => 'Créer un utilisateur',
        ],
        'empty' => [
            'title' => 'Aucun utilisateur pour le moment',
            'description' => 'Créez votre premier utilisateur pour commencer.',
        ],
        'table' => [
            'user' => 'Utilisateur',
            'roles' => 'Rôles',
            'last_login' => 'Dernière connexion',
            'joined' => 'Inscrit le',
            'no_roles' => 'Aucun rôle',
            'inactive' => 'Inactif',
            'actions' => [
                'edit' => 'Modifier les rôles',
                'delete' => 'Supprimer l’utilisateur',
                'activate' => 'Activer l’utilisateur',
                'deactivate' => 'Désactiver l’utilisateur',
            ],
        ],
        'pagination' => [
            'summary' => 'Page {{current}} sur {{last}} · {{total}} utilisateurs',
        ],
        'flash' => [
            'success' => 'Succès',
            'error' => 'Erreur',
        ],
        'delete_confirm' => 'Supprimer {{name}} ? Cette action est irréversible.',
    ],
    'create_modal' => [
        'title' => 'Créer un utilisateur',
        'fields' => [
            'name' => 'Nom',
            'email' => 'E-mail',
            'password' => 'Mot de passe',
            'roles' => 'Rôles',
        ],
        'actions' => [
            'cancel' => 'Annuler',
            'submit' => 'Créer l’utilisateur',
            'submitting' => 'Création…',
        ],
    ],
    'edit_modal' => [
        'title' => 'Rôles',
        'actions' => [
            'cancel' => 'Annuler',
            'submit' => 'Enregistrer les rôles',
            'submitting' => 'Enregistrement…',
        ],
    ],
    'roles' => [
        'super_admin' => 'Super administrateur',
        'admin' => 'Administrateur',
        'recruiter' => 'Recruteur',
        'hiring_manager' => 'Responsable recrutement',
        'viewer' => 'Lecteur',
    ],

];
