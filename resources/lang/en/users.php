<?php

return [

    'index' => [
        'title' => 'Users',
        'subtitle_one' => '1 user · Assign roles to control access.',
        'subtitle_other' => '{{count}} users · Assign roles to control access.',
        'nav' => [
            'roles' => 'Roles',
        ],
        'actions' => [
            'create' => 'Create user',
        ],
        'empty' => [
            'title' => 'No users yet',
            'description' => 'Create your first user to get started.',
        ],
        'table' => [
            'user' => 'User',
            'roles' => 'Roles',
            'last_login' => 'Last Login',
            'joined' => 'Joined',
            'no_roles' => 'No roles',
            'actions' => [
                'edit' => 'Edit roles',
                'delete' => 'Delete user',
                'activate' => 'Activate user',
                'deactivate' => 'Deactivate user',
            ],
        ],
        'pagination' => [
            'summary' => 'Page {{current}} of {{last}} · {{total}} users',
        ],
        'flash' => [
            'success' => 'Success',
            'error' => 'Error',
        ],
        'delete_confirm' => 'Delete {{name}}? This cannot be undone.',
    ],
    'create_modal' => [
        'title' => 'Create user',
        'fields' => [
            'name' => 'Name',
            'email' => 'Email',
            'password' => 'Password',
            'roles' => 'Roles',
        ],
        'actions' => [
            'cancel' => 'Cancel',
            'submit' => 'Create user',
            'submitting' => 'Creating…',
        ],
    ],
    'edit_modal' => [
        'title' => 'Roles',
        'actions' => [
            'cancel' => 'Cancel',
            'submit' => 'Save roles',
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

];
