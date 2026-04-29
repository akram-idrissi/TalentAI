<?php

return [

    'create_briefs' => [
        'breadcrumb' => 'Sourcing › New brief',

        'create' => [
            'title' => 'Create a recruitment brief',
            'subtitle' => 'Fill in the criteria · The AI will use them to analyse candidates',

            'sections' => [
                'position' => 'Position information',
                'candidate' => 'Candidate criteria',
                'description' => 'Description',
                'scoring' => 'AI scoring weights',
            ],
        ],

        'fields' => [
            'title' => 'Job title',
            'title_placeholder' => 'e.g. Senior Full-Stack Developer',
            'sector' => 'Sector',
            'sector_placeholder' => 'e.g. Technology, Finance…',
            'contract_type' => 'Contract type',
            'contract_type_placeholder' => 'Select a contract type',
            'location' => 'Location',
            'location_placeholder' => 'e.g. Paris, Remote…',
            'salary_range' => 'Salary range',
            'salary_range_placeholder' => 'e.g. 40000 - 55000 €',
            'min_experience_years' => 'Minimum experience (years)',
            'min_experience_years_placeholder' => 'e.g. 3',
            'education_level' => 'Education level',
            'education_level_placeholder' => 'e.g. Bachelor, Master…',
            'required_skills' => 'Required skills',
            'required_skills_placeholder' => 'e.g. Python, SQL…',
            'languages' => 'Required languages ',
            'languages_placeholder' => 'e.g. English, French, Arabe…',
            'age_range' => 'Preferred age range',
            'age_range_placeholder' => 'e.g. 25 - 35',
            'gender_pref' => 'Gender preference',
            'gender_pref_placeholder' => 'No preference',
            'mission_description' => 'Main mission',
            'mission_description_placeholder' => 'Describe the main responsibilities and expected deliverables…',
            'soft_skills' => 'Soft skills',
            'soft_skills_placeholder' => 'e.g. Leadership, Teamwork, Adaptability…',
        ],

        'scoring' => [
            'total' => 'Total',
            'experience' => 'Experience',
            'education' => 'Education',
            'sector' => 'Sector',
            'soft_skills' => 'Soft skills',
            'location' => 'Location',
        ],

        'actions' => [
            'save_draft' => 'Save as draft',
            'create' => 'Create brief',
            'creating' => 'Creating…',
            'back' => 'Back',
        ],
    ],

    'validation' => [
        'required' => 'This field is required.',
        'min_length' => 'This field must contain at least :min characters.',
        'max_length' => 'This field must not exceed :max characters.',
        'positive_number' => 'Please enter a valid positive number.',
        'max_value' => 'The value must not exceed :max.',
        'salary_format' => 'Invalid format. Example: 40000 - 55000 € or 40000.',
        'age_format' => 'Invalid format. Example: 25 - 35 or 30.',
        'weight_range' => 'Each weight must be between 0 and 100.',
        'weight_total' => 'The total of all weights must equal 100 (currently :total).',
    ],
    'show_brief' => [
        'breadcrumb' => 'Sourcing › Brief details',
        'subtitle' => 'Full details of the recruitment brief',

        'sections' => [
            'position' => 'Position information',
            'candidate' => 'Candidate criteria',
            'description' => 'Description',
            'scoring' => 'AI Scoring',
            'meta' => 'System information',
        ],

        'fields' => [
            'title' => 'Job title',
            'sector' => 'Sector',
            'contract_type' => 'Contract type',
            'location' => 'Location',
            'salary_range' => 'Salary range',
            'status' => 'Status',
            'min_experience_years' => 'Experience',
            'years' => 'years',
            'education_level' => 'Education level',
            'age_range' => 'Age range',
            'gender_pref' => 'Gender preference',
            'required_skills' => 'Required skills',
            'soft_skills' => 'Soft skills',
            'created_by' => 'Created by:',
            'created_at' => 'Date:',
            'languages' => 'Languages',
        ],

        'statuses' => [
            'active' => 'Active',
            'draft' => 'Draft',
        ],

        'scoring' => [
            'experience' => 'Experience',
            'education' => 'Education',
            'sector' => 'Sector',
            'soft_skills' => 'Soft skills',
            'location' => 'Location',
        ],

        'actions' => [
            'back' => 'Back to list',
            'edit' => 'Edit',
            'delete' => 'Delete',
            'delete_confirm' => 'Are you sure you want to delete this brief?',
            'delete_yes' => 'Yes, delete',
            'delete_no' => 'Cancel',
            'delete_confirm' => 'Are you sure?',
        ],
    ],
    'fallback' => [
        'breadcrumb' => 'Sourcing › Error',
        'title' => 'Something went wrong',
        'subtitle' => 'An unexpected error occurred',
        'heading' => 'Unable to load this page',
        'description' => 'An error occurred on our end. You can try again or go back to the list.',

        'actions' => [
            'back' => 'Back to list',
            'retry' => 'Try again',
        ],
    ],

];
