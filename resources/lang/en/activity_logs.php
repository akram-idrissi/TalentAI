<?php

return [

    'index' => [
        'title' => 'Activity Log',
        'subtitle' => 'All actions recorded in the application.',

        'table' => [
            'user' => 'User',
            'action' => 'Action',
            'description' => 'Description',
            'method' => 'Method',
            'ip' => 'IP',
            'date' => 'Date',
        ],

        'filters' => [
            'search_placeholder' => 'Search descriptions, actions…',
            'user_placeholder' => 'Filter by user…',
            'all_actions' => 'All actions',
            'date_from' => 'From',
            'date_to' => 'To',
        ],

        'actions' => [
            'filter' => 'Filter',
            'reset' => 'Reset',
            'view' => 'View detail',
        ],

        'pagination' => [
            'summary' => '{{from}}–{{to}} of {{total}} entries',
            'total' => '{{total}} entries',
            'prev' => 'Previous page',
            'next' => 'Next page',
        ],

        'empty' => [
            'title' => 'No entries found',
            'description' => 'Adjust your filters or come back later.',
        ],

        'auth' => [
            'authenticated' => 'Authenticated',
            'not_authenticated' => 'Not authenticated',
        ],

        'unknown_user' => 'Unknown',

        'flash' => [
            'index_error' => 'Unable to load the activity logs.',
            'show_error' => 'Unable to display this log entry.',
        ],
    ],

    'show' => [
        'title' => 'Log detail',
        'back' => 'Back to logs',

        'sections' => [
            'action' => 'Action & Description',
            'user' => 'User',
            'request' => 'HTTP Request',
            'controller' => 'Controller',
            'models' => 'Related models',
            'properties' => 'Properties',
        ],

        'fields' => [
            'action' => 'Action',
            'description' => 'Description',
            'logged_at' => 'Logged at',
            'user' => 'User',
            'role' => 'Role',
            'authenticated' => 'Authenticated',
            'http_method' => 'HTTP method',
            'url' => 'URL',
            'ip_address' => 'IP address',
            'controller' => 'Controller',
            'controller_method' => 'Method',
        ],

        'yes' => 'Yes',
        'no' => 'No',
    ],

];
