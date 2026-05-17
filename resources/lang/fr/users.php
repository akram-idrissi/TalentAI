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
            // Succès
            'created' => 'Utilisateur :name créé avec succès.',
            'deleted' => 'Utilisateur :name supprimé.',
            'roles_updated' => 'Rôles de :name mis à jour.',
            'activated' => 'Utilisateur :name activé.',
            'deactivated' => 'Utilisateur :name désactivé.',

            // Erreurs
            'index_error' => 'Impossible de charger la liste des utilisateurs.',
            'create_error' => "Impossible de créer l'utilisateur.",
            'delete_error' => "Impossible de supprimer l'utilisateur.",
            'roles_update_error' => 'Impossible de mettre à jour les rôles.',
            'activate_error' => "Impossible d'activer l'utilisateur.",
            'deactivate_error' => "Impossible de désactiver l'utilisateur.",
        ],
        'delete_confirm' => 'Supprimer {{name}} ? Cette action est irréversible.',
        'search' => [
            'all_roles' => 'Tous les rôles',
            'placeholder' => 'Rechercher par nom ou e-mail…',
            'clear' => 'Effacer la recherche',
            'no_results' => 'Aucun résultat',
            'no_results_hint' => 'Essayez de ajuster vos critères de recherche.',
        ],
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
