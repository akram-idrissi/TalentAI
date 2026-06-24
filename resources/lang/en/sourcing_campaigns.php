<?php

return [

    'index' => [
        'title' => 'Sourcing Campaigns',
        'subtitle' => 'History of LinkedIn post and comment collections.',

        'toolbar' => [
            'new' => 'New Sourcing Campaign',
        ],

        'empty' => [
            'title' => 'No sourcing campaigns yet',
            'description' => 'Launch your first LinkedIn post collection.',
            'cta' => 'New Sourcing Campaign',
        ],

        'columns' => [
            'brief' => 'BRIEF',
            'targets' => 'TARGETS',
            'posts' => 'POSTS',
            'candidates' => 'CANDIDATES',
            'status' => 'STATUS',
            'started' => 'STARTED',
            'campaigns' => 'CAMPAIGNS',
        ],

        'table' => [
            'no_brief' => '—',
            'url_single' => 'URL',
            'url_plural' => 'URLs',
            'no_candidates' => '—',
            'view' => 'View details',
        ],

        'pagination' => [
            'summary_range' => ':from–:to of :total runs',
            'summary_total' => ':total runs',
            'previous' => 'Previous page',
            'next' => 'Next page',
        ],

        'status' => [
            'pending' => 'Pending',
            'running' => 'Running',
            'completed' => 'Completed',
            'failed' => 'Failed',
        ],
    ],

    'create' => [
        'breadcrumb' => 'Sourcing Campaigns › New Sourcing Campaign',

        'header' => [
            'back' => 'Back',
            'parent' => 'Sourcing Campaigns',
            'title' => 'Start a New Sourcing Campaign',
            'subtitle' => 'Select the LinkedIn profiles or companies to scrape and configure the collection settings.',
        ],

        'sections' => [
            'configuration' => 'Configuration',
            'configuration_desc' => 'Choose which job brief and social platforms to target.',
            'parameters' => 'Collection Parameters',
            'parameters_desc' => 'Fine-tune limits and date filters for this scrape.',
        ],

        'fields' => [
            'brief' => [
                'label' => 'Associated Brief',
                'placeholder' => 'Select a brief…',
            ],
            'target_urls' => [
                'label' => 'LinkedIn Profiles / Companies',
                'placeholder' => 'Search for a profile or company…',
                'no_options' => 'No results found',
                'hint_single' => ':count URL selected',
                'hint_plural' => ':count URLs selected',
            ],
            'max_posts' => [
                'label' => 'Maximum Posts per Profile',
                'hint' => '0 = all available posts',
            ],
            'posted_limit_date' => [
                'label' => 'Collect posts after',
                'hint' => 'Leave empty to collect everything',
            ],
        ],

        'actions' => [
            'cancel' => 'Cancel',
            'submit' => 'Start Campaign →',
            'submitting' => 'Starting…',
        ],

        'summary' => [
            'title' => 'Campaign summary',
            'ready' => 'Ready to launch',
            'incomplete' => 'Fill required fields',
            'tip' => 'The campaign will start immediately after submission.',
        ],
    ],

    'show' => [
        'title' => 'Sourcing Campaign #:id',
        'subtitle' => 'Post & Comment Collector',

        'breadcrumb' => [
            'all' => 'All runs',
            'back' => 'Back to Sourcing Campaigns',
        ],

        'status' => [
            'pending' => 'Pending',
            'running' => 'Running',
            'completed' => 'Completed',
            'failed' => 'Failed',
        ],

        'cards' => [
            'target_urls' => [
                'title' => 'Target URLs',
            ],
            'status' => [
                'title' => 'Status',
                'label' => 'Current Status',
                'scrape_in_progress' => 'Post collection is in progress — the page updates automatically.',
                'enrich_in_progress' => 'Candidate enrichment is in progress — the page updates automatically.',
            ],
            'posts' => [
                'title' => 'Collected Posts',
                'unit_single' => 'post collected',
                'unit_plural' => 'posts collected',
            ],
            'enrichment' => [
                'label' => 'Candidate Enrichment',
                'complete' => '✓ Completed',
                'running' => 'Enriching…',
            ],
        ],

        'posts_section' => [
            'title' => 'Posts',
            'empty_pending' => 'Posts will appear here once the run is complete.',
            'empty_done' => 'No posts found.',
            'no_comments' => 'No comments collected.',
            'view_post' => 'View original post ↗',
        ],

        'comments_table' => [
            'commenter' => 'Commenter',
            'comment' => 'Comment',
            'candidate' => 'Candidate',
        ],

        'candidat_badge' => [
            'view' => 'View',
        ],

        'post_card' => [
            'unknown_author' => 'Unknown Author',
        ],
    ],

];
