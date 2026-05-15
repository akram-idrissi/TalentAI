<?php

return [
    'index' => [
        'title' => 'Transcription audio',
        'subtitle' => 'Importez un fichier audio pour générer une transcription diarisée automatiquement.',

        'actions' => [
            'transcribe' => 'Transcrire',
            'reset' => 'Réinitialiser',
            'copy' => 'Copier',
            'copied' => 'Copié !',
            'download' => 'Télécharger',
        ],

        'empty' => [
            'title' => 'Aucun fichier sélectionné',
            'description' => 'Déposez un fichier audio ou cliquez pour parcourir vos fichiers.',
        ],

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
];
