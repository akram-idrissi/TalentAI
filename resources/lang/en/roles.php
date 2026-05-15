<?php

return [

    'index' => [
        'title' => 'Roles',
        'subtitle' => 'Manage role permissions for your organisation.',
        'nav' => [
            'users' => 'Manage users →',
        ],
        'table' => [
            'role' => 'Role',
            'users' => 'Users',
            'permissions' => 'Permissions',
            'user_count' => [
                'one' => '1 user',
                'other' => '{{count}} users',
            ],
            'more' => '+{{count}} more',
            'all_permissions' => 'All permissions',
            'no_permissions' => 'No permissions',
            'super_admin_note' => 'Gate bypass — all permissions',
            'actions' => [
                'edit' => 'Edit permissions',
            ],
        ],
        'flash' => [
            // Success
            'updated' => 'Permissions for ":role" updated.',

            // Errors
            'index_error' => 'Unable to load the roles list.',
            'update_error' => 'Unable to update permissions.',
        ],

    ],

    'edit_modal' => [
        'title' => 'Edit permissions',
        'actions' => [
            'cancel' => 'Cancel',
            'submit' => 'Save permissions',
            'submitting' => 'Saving…',
        ],
    ],

    'roles' => [
        'super_admin' => 'Super Admin',
        'admin' => 'Admin',
        'recruiter' => 'Recruiter',
        'hiring_manager' => 'Hiring Manager',
        'viewer' => 'Viewer',
    ],

    'modules' => [
        'briefs' => 'Briefs',
        'candidates' => 'Candidates',
        'users' => 'Users',
        'roles' => 'Roles',
        'sourcing' => 'Sourcing',
        'interviews' => 'Interviews',
        'reports' => 'Reports',
        'settings' => 'Settings',
    ],

];
