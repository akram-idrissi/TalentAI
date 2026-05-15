<?php

return [
    'index' => [
        'title' => 'Audio transcription',
        'subtitle' => 'Upload an audio file to automatically generate a diarized transcript.',

        'actions' => [
            'transcribe' => 'Transcribe',
            'reset' => 'Reset',
            'copy' => 'Copy',
            'copied' => 'Copied!',
            'download' => 'Download',
        ],

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
];
