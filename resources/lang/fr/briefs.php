<?php

return [

    'create_briefs' => [
        'breadcrumb' => 'Sourcing › Nouveau brief',

        'create' => [
            'title' => 'Créer un brief de recrutement',
            'subtitle' => 'Renseignez les critères · L\'IA les utilisera pour analyser les candidats',

            'sections' => [
                'position' => 'Informations du poste',
                'candidate' => 'Critères candidat',
                'description' => 'Description',
                'scoring' => 'Poids scoring IA',
            ],
        ],

        'fields' => [
            'title' => 'Intitulé du poste',
            'title_placeholder' => 'ex. Développeur Full-Stack Senior',
            'sector' => 'Secteur',
            'sector_placeholder' => 'ex. Technologie, Finance…',
            'contract_type' => 'Type de contrat',
            'contract_type_placeholder' => 'Sélectionner un type de contrat',
            'location' => 'Localisation',
            'location_placeholder' => 'ex. Paris, Télétravail…',
            'salary_range' => 'Fourchette salariale',
            'salary_range_placeholder' => 'ex. 40 000 - 55 000 €',
            'min_experience_years' => 'Expérience minimale (années)',
            'min_experience_years_placeholder' => 'ex. 3',
            'education_level' => 'Niveau d\'études',
            'education_level_placeholder' => 'ex. Licence, Master…',
            'required_skills' => 'Compétences requises',
            'required_skills_placeholder' => 'ex. Python, SQL…',
            'languages' => 'Langues requises',
            'languages_placeholder' => 'e.g. Anglais, Arabe…',
            'age_range' => 'Tranche d\'âge souhaitée',
            'age_range_placeholder' => 'ex. 25 - 35',
            'gender_pref' => 'Préférence de genre',
            'gender_pref_placeholder' => 'Sans préférence',
            'mission_description' => 'Mission principale',
            'mission_description_placeholder' => 'Décrivez les responsabilités principales et les livrables attendus…',
            'soft_skills' => 'Soft skills',
            'soft_skills_placeholder' => 'ex. Leadership, Travail d\'équipe, Adaptabilité…',
        ],

        'scoring' => [
            'total' => 'Total',
            'experience' => 'Expérience',
            'education' => 'Formation',
            'sector' => 'Secteur',
            'soft_skills' => 'Soft skills',
            'location' => 'Localisation',
        ],

        'actions' => [
            'save_draft' => 'Brouillon',
            'create' => 'Créer brief',
            'creating' => 'Création…',
            'back' => 'Retour',
        ],
    ],

    'validation' => [
        'required' => 'Ce champ est obligatoire.',
        'min_length' => 'Ce champ doit contenir au moins :min caractères.',
        'max_length' => 'Ce champ ne doit pas dépasser :max caractères.',
        'positive_number' => 'Veuillez saisir un nombre positif valide.',
        'max_value' => 'La valeur ne doit pas dépasser :max.',
        'salary_format' => 'Format invalide. Exemple : 40 000 - 55 000 € ou 40 000.',
        'age_format' => 'Format invalide. Exemple : 25 - 35 ou 30.',
        'weight_range' => 'Chaque poids doit être compris entre 0 et 100.',
        'weight_total' => 'La somme des poids doit être égale à 100 (actuellement :total).',
    ],

];
