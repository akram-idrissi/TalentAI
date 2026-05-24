<?php

return [
    'index' => [
        'title' => 'Interview Management',
        'subtitle' => 'Manage your interviews and access their transcriptions.',
        'form' => [
            'title' => 'Import Interview',
            'candidate_placeholder' => 'Select a candidate…',
            'brief_placeholder' => 'Select a brief…',
        ],
        'actions' => [
            'upload' => 'Upload',
            'uploading' => 'Uploading…',
            'reset' => 'Reset',
            'copy' => 'Copy',
            'copied' => 'Copied!',
            'download' => 'Download',
        ],
        'history_title' => 'Recent Interviews',
        'history_empty' => 'No interviews found',
        'history_description' => 'Your processed interviews will appear here.',

        'empty' => [
            'title' => 'No file selected',
            'description' => 'Drop an audio file here or click to browse your files.',
        ],

        'dropzone' => [
            'prompt' => 'Drop your audio file here or :link',
            'link' => 'browse',
            'formats' => 'MP3 · WAV · M4A — max 80 MB',
        ],

        'progress' => [
            'uploading' => 'Uploading file…',
            'pending' => 'Queued — waiting for a worker…',
            'processing' => 'Transcribing audio…',
            'done' => 'Done',
            'failed' => 'Transcription failed',
        ],

        'result' => [
            'label' => 'Transcript',
            'word_count' => ':count words',
        ],

        'status' => [
            'done' => 'Done',
            'processing' => 'Processing',
            'pending' => 'Pending',
            'failed' => 'Failed',
        ],

        'errors' => [
            'unsupported_format' => 'Unsupported format. Please use MP3, WAV or M4A.',
            'file_too_large' => 'File exceeds the 80 MB limit.',
            'no_job_id' => 'The server did not return a job ID.',
            'connection_lost' => 'Lost connection while polling.',
            'upload_failed' => 'Upload failed.',
        ],
    ],
    'list' => [
        'title' => 'All Interviews',
        'subtitle' => 'Get insights from your interviews and make informed hiring decisions.',
        'new' => '+ New Interview',

        'filters' => [
            'search' => 'Search candidate or brief…',
            'status' => 'Status',
            'platform' => 'Platform',
            'all_statuses' => 'All statuses',
            'all_platforms' => 'All platforms',
            'clear' => 'Clear filters',
        ],

        'empty' => [
            'title' => 'No interviews found',
            'description' => 'Submit a recording to get started.',
            'no_results' => 'No interviews match your filters.',
        ],

        'pagination' => [
            'summary' => 'Page {{current}} of {{last}}',
            'previous' => 'Previous',
            'next' => 'Next',
        ],

        'row' => [
            'min' => '{{count}} min',
            'report' => 'Report →',
            'view' => 'View →',
        ],

        'status' => [
            'done' => '✓ Report ready',
            'done_short' => 'Done',
            'processing' => 'Processing',
            'pending' => 'Pending',
            'failed' => 'Failed',
            'none' => '—',
        ],

        'platforms' => [
            'zoom' => 'Zoom',
            'meet' => 'Meet',
            'teams' => 'Teams',
            'presentiel' => 'In-person',
        ],
    ],
];
