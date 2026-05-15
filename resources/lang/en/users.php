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
            'inactive' => 'Inactive',
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
            // Success
            'created' => 'User :name created successfully.',
            'deleted' => 'User :name deleted.',
            'roles_updated' => 'Roles for :name updated.',
            'activated' => 'User :name activated.',
            'deactivated' => 'User :name deactivated.',

            // Errors
            'index_error' => 'Unable to load the users list.',
            'create_error' => 'Unable to create the user.',
            'delete_error' => 'Unable to delete the user.',
            'roles_update_error' => 'Unable to update roles.',
            'activate_error' => 'Unable to activate the user.',
            'deactivate_error' => 'Unable to deactivate the user.',
        ],
        'delete_confirm' => 'Delete {{name}}? This cannot be undone.',
        'search' => [
            'all_roles' => 'All Roles',
            'placeholder' => 'Search by name or email…',
            'clear' => 'Clear search',
            'no_results' => 'No results',
            'no_results_hint' => 'Try adjusting your search criteria.',
        ],
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
