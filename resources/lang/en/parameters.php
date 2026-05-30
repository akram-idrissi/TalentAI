<?php

return [

    'index' => [
        'title' => 'Parameters',
        'subtitle' => 'Manage the reference lists used in forms.',
        'system_badge' => 'System',
        'active_suffix' => 'active',
        'columns' => [
            'group' => 'Group',
            'key' => 'Key',
            'values' => 'Values',
            'status' => 'Status',
        ],
        'empty' => [
            'title' => 'No parameter groups',
            'description' => 'Create your first group to get started.',
        ],
        'actions' => [
            'create' => 'New group',
            'manage' => 'Manage values',
            'edit' => 'Edit',
            'activate' => 'Activate',
            'deactivate' => 'Deactivate',
            'delete' => 'Delete',
        ],
    ],

    'show' => [
        'key_label' => 'Key',
        'value_placeholder' => 'e.g. bac5',
        'label_placeholder' => 'e.g. Master\'s degree',
        'empty' => 'No values yet',
        'empty_description' => 'Add your first value to make this group available in forms.',
        'empty_cta' => 'Add first value',
        'columns' => [
            'value' => 'Value',
            'label' => 'Label',
        ],
        'actions' => [
            'back' => 'Back',
            'edit_group' => 'Edit group',
            'add_value' => 'Add value',
            'save' => 'Save',
            'cancel' => 'Cancel',
        ],
    ],

    'create' => [
        'title' => 'New group',
        'subtitle' => 'Create a group to organise reference values.',
    ],

    'edit' => [
        'title' => 'Edit group',
        'subtitle' => 'Update the group metadata. Values are managed separately.',
    ],

    'fields' => [
        'label' => 'Group name',
        'label_placeholder' => 'e.g. Education levels',
        'key' => 'Technical key',
        'key_placeholder' => 'e.g. education_levels',
        'key_hint' => 'Lowercase letters, digits, and underscores only. Used in code.',
        'key_edit_hint' => 'Warning: changing the key requires updating references in the code.',
        'key_system_hint' => 'The key of a system group cannot be modified.',
        'description' => 'Description',
        'description_placeholder' => 'Short description for the admin team…',
        'active' => 'Active',
        'active_hint' => 'Inactive groups are not exposed to forms.',
    ],

    'status' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
    ],

    'actions' => [
        'cancel' => 'Cancel',
        'create' => 'Create group',
        'creating' => 'Creating…',
        'save' => 'Save',
        'saving' => 'Saving…',
    ],

    'modal' => [
        'title' => 'Delete this parameter?',
        'description' => 'This action is irreversible.',
        'confirm' => 'Delete',
        'cancel' => 'Cancel',
    ],

];
