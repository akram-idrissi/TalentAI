<?php

return [

    'index' => [
        'title' => 'Paramètres',
        'subtitle' => 'Gérez les listes de référence utilisées dans les formulaires.',
        'system_badge' => 'Système',
        'active_suffix' => 'actives',
        'columns' => [
            'group' => 'Groupe',
            'key' => 'Clé',
            'values' => 'Valeurs',
            'status' => 'Statut',
        ],
        'empty' => [
            'title' => 'Aucun groupe de paramètres',
            'description' => 'Créez votre premier groupe pour commencer.',
        ],
        'actions' => [
            'create' => 'Nouveau groupe',
            'manage' => 'Gérer les valeurs',
            'edit' => 'Modifier',
            'activate' => 'Activer',
            'deactivate' => 'Désactiver',
            'delete' => 'Supprimer',
        ],
    ],

    'show' => [
        'key_label' => 'Clé',
        'value_placeholder' => 'ex : bac5',
        'label_placeholder' => 'ex : Bac+5 (Master)',
        'empty' => 'Aucune valeur pour le moment',
        'empty_description' => 'Ajoutez votre première valeur pour rendre ce groupe disponible dans les formulaires.',
        'empty_cta' => 'Ajouter la première valeur',
        'columns' => [
            'value' => 'Valeur',
            'label' => 'Label',
        ],
        'actions' => [
            'back' => 'Retour',
            'edit_group' => 'Modifier le groupe',
            'add_value' => 'Ajouter une valeur',
            'save' => 'Enregistrer',
            'cancel' => 'Annuler',
        ],
    ],

    'create' => [
        'title' => 'Nouveau groupe',
        'subtitle' => 'Créez un groupe pour regrouper des valeurs de référence.',
    ],

    'edit' => [
        'title' => 'Modifier le groupe',
        'subtitle' => 'Modifiez les métadonnées du groupe. Les valeurs sont gérées séparément.',
    ],

    'fields' => [
        'label' => 'Nom du groupe',
        'label_placeholder' => 'ex : Niveaux d\'éducation',
        'key' => 'Clé technique',
        'key_placeholder' => 'ex : education_levels',
        'key_hint' => 'Minuscules, chiffres et underscores uniquement. Utilisée dans le code.',
        'key_edit_hint' => 'Attention : modifier la clé nécessite de mettre à jour les références dans le code.',
        'key_system_hint' => 'La clé d\'un groupe système ne peut pas être modifiée.',
        'description' => 'Description',
        'description_placeholder' => 'Courte description pour l\'équipe admin…',
        'active' => 'Actif',
        'active_hint' => 'Les groupes inactifs ne sont pas exposés aux formulaires.',
    ],

    'status' => [
        'active' => 'Actif',
        'inactive' => 'Inactif',
    ],

    'actions' => [
        'cancel' => 'Annuler',
        'create' => 'Créer le groupe',
        'creating' => 'Création…',
        'save' => 'Enregistrer',
        'saving' => 'Enregistrement…',
    ],

    'modal' => [
        'title' => 'Supprimer ce paramètre ?',
        'description' => 'Cette action est irréversible.',
        'confirm' => 'Supprimer',
        'cancel' => 'Annuler',
    ],

];
