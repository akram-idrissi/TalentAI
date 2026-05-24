<?php

return [
    'index' => [
        'title' => 'Gestion des entretiens',
        'subtitle' => 'Gérez vos entretiens et accédez à leurs transcriptions.',
        'form' => [
            'title' => 'Importer un entretien',
            'candidate_placeholder' => 'Sélectionnez un candidat…',
            'brief_placeholder' => 'Sélectionnez un brief…',
        ],
        'actions' => [
            'upload' => 'Téléverser',
            'uploading' => 'Téléversement…',
            'reset' => 'Réinitialiser',
            'copy' => 'Copier',
            'copied' => 'Copié !',
            'download' => 'Télécharger',
        ],

        'empty' => [
            'title' => 'Aucun fichier sélectionné',
            'description' => 'Déposez un fichier audio ou cliquez pour parcourir vos fichiers.',
        ],
        'history_title' => 'Entretiens récents',
        'history_empty' => 'Aucun entretien trouvé',
        'history_description' => 'Vos entretiens traités apparaîtront ici.',

        'dropzone' => [
            'prompt' => 'Déposez votre fichier audio ou :link',
            'link' => 'parcourez',
            'formats' => 'MP3 · WAV · M4A — max 80 Mo',
        ],

        'progress' => [
            'uploading' => 'Envoi du fichier…',
            'pending' => 'En file d\'attente — en attente d\'un worker…',
            'processing' => 'Transcription en cours…',
            'done' => 'Terminé',
            'failed' => 'Échec de la transcription',
        ],

        'result' => [
            'label' => 'Transcription',
            'word_count' => ':count mots',
        ],

        'status' => [
            'done' => 'Terminé',
            'processing' => 'En cours',
            'pending' => 'En attente',
            'failed' => 'Échoué',
        ],

        'errors' => [
            'unsupported_format' => 'Format non supporté. Utilisez MP3, WAV ou M4A.',
            'file_too_large' => 'Le fichier dépasse la limite de 80 Mo.',
            'no_job_id' => 'Le serveur n\'a pas retourné d\'identifiant.',
            'connection_lost' => 'Connexion perdue lors du suivi.',
            'upload_failed' => 'Échec de l\'envoi.',
        ],
    ],
    'list' => [
        'title' => 'Tous les entretiens',
        'subtitle' => 'Obtenez des insights de vos entretiens et prenez des décisions de recrutement éclairées.',
        'new' => '+ Nouvel entretien',

        'filters' => [
            'search' => 'Rechercher un candidat ou un brief…',
            'status' => 'Statut',
            'platform' => 'Plateforme',
            'all_statuses' => 'Tous les statuts',
            'all_platforms' => 'Toutes les plateformes',
            'clear' => 'Effacer les filtres',
        ],

        'empty' => [
            'title' => 'Aucun entretien trouvé',
            'description' => 'Soumettez un enregistrement pour commencer.',
            'no_results' => 'Aucun entretien ne correspond à vos filtres.',
        ],

        'pagination' => [
            'summary' => 'Page {{current}} sur {{last}}',
            'previous' => 'Précédent',
            'next' => 'Suivant',
        ],

        'row' => [
            'min' => '{{count}} min',
            'report' => 'Rapport →',
            'view' => 'Voir →',
        ],

        'status' => [
            'done' => '✓ Rapport prêt',
            'done_short' => 'Rapport prêt',
            'processing' => 'En cours',
            'pending' => 'En attente',
            'failed' => 'Échoué',
            'none' => '—',
        ],

        'platforms' => [
            'zoom' => 'Zoom',
            'meet' => 'Meet',
            'teams' => 'Teams',
            'presentiel' => 'Presentiel',
        ],
    ],
];
