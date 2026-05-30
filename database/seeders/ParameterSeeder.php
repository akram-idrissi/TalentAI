<?php

namespace Database\Seeders;

use App\Models\ParameterGroup;
use Illuminate\Database\Seeder;

class ParameterSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [

            'sectors' => [
                'label' => 'Secteurs d\'activité',
                'system' => true,
                'values' => [
                    ['value' => 'commerce',   'label' => 'Commerce & Vente',          'order' => 1],
                    ['value' => 'tech',       'label' => 'Tech & Digital',             'order' => 2],
                    ['value' => 'finance',    'label' => 'Finance & Audit',            'order' => 3],
                    ['value' => 'rh',         'label' => 'RH & Formation',             'order' => 4],
                    ['value' => 'marketing',  'label' => 'Marketing',                  'order' => 5],
                    ['value' => 'operations', 'label' => 'Opérations & Logistique',    'order' => 6],
                    ['value' => 'juridique',  'label' => 'Juridique',                  'order' => 7],
                    ['value' => 'sante',      'label' => 'Santé',                      'order' => 8],
                ],
            ],

            'education_levels' => [
                'label' => 'Niveaux d\'éducation',
                'system' => true,
                'values' => [
                    ['value' => 'bac',               'label' => 'Bac',                    'order' => 1],
                    ['value' => 'bac2',              'label' => 'Bac+2',                  'order' => 2],
                    ['value' => 'bac3',              'label' => 'Bac+3 (Licence)',         'order' => 3],
                    ['value' => 'bac5',              'label' => 'Bac+5 (Master)',          'order' => 4],
                    ['value' => 'bac5_grande_ecole', 'label' => 'Bac+5 Grande École',      'order' => 5],
                    ['value' => 'doctorat',          'label' => 'Doctorat',               'order' => 6],
                ],
            ],

            'experience_options' => [
                'label' => 'Années d\'expérience',
                'system' => true,
                'values' => [
                    ['value' => '0',  'label' => 'Débutant (0 an)', 'order' => 1],
                    ['value' => '2',  'label' => '2 ans',           'order' => 2],
                    ['value' => '3',  'label' => '3 ans',           'order' => 3],
                    ['value' => '5',  'label' => '5 ans',           'order' => 4],
                    ['value' => '8',  'label' => '8 ans',           'order' => 5],
                    ['value' => '10', 'label' => '10 ans',          'order' => 6],
                    ['value' => '15', 'label' => '15 ans+',         'order' => 7],
                ],
            ],

            'age_ranges' => [
                'label' => 'Tranches d\'âge',
                'system' => true,
                'values' => [
                    ['value' => '20-30', 'label' => '20 – 30 ans', 'order' => 1],
                    ['value' => '25-35', 'label' => '25 – 35 ans', 'order' => 2],
                    ['value' => '28-40', 'label' => '28 – 40 ans', 'order' => 3],
                    ['value' => '32-48', 'label' => '32 – 48 ans', 'order' => 4],
                    ['value' => '35-55', 'label' => '35 – 55 ans', 'order' => 5],
                ],
            ],

            'languages' => [
                'label' => 'Langues',
                'system' => true,
                'values' => [
                    ['value' => 'Arabe',    'label' => 'Arabe',    'order' => 1],
                    ['value' => 'Français', 'label' => 'Français', 'order' => 2],
                    ['value' => 'Anglais',  'label' => 'Anglais',  'order' => 3],
                    ['value' => 'Espagnol', 'label' => 'Espagnol', 'order' => 4],
                    ['value' => 'Amazigh',  'label' => 'Amazigh',  'order' => 5],
                ],
            ],

            'seniority_levels' => [
                'label' => 'Niveaux de séniorité',
                'system' => true,
                'values' => [
                    ['value' => 'intern',    'label' => 'Stage / Alternance',       'order' => 1],
                    ['value' => 'entry',     'label' => 'Débutant (0-2 ans)',        'order' => 2],
                    ['value' => 'mid',       'label' => 'Intermédiaire (2-5 ans)',   'order' => 3],
                    ['value' => 'senior',    'label' => 'Senior (5+ ans)',           'order' => 4],
                    ['value' => 'manager',   'label' => 'Manager',                  'order' => 5],
                    ['value' => 'director',  'label' => 'Directeur',                'order' => 6],
                    ['value' => 'executive', 'label' => 'Cadre dirigeant',          'order' => 7],
                ],
            ],

            'contract_types' => [
                'label' => 'Types de contrat',
                'system' => true,
                'values' => [
                    ['value' => 'CDI',       'label' => 'CDI',        'order' => 1],
                    ['value' => 'CDD',       'label' => 'CDD',        'order' => 2],
                    ['value' => 'Freelance', 'label' => 'Freelance',  'order' => 3],
                    ['value' => 'Stage',     'label' => 'Stage',      'order' => 4],
                    ['value' => 'Alternance', 'label' => 'Alternance', 'order' => 5],
                ],
            ],

            'gender_prefs' => [
                'label' => 'Préférences de genre',
                'system' => true,
                'values' => [
                    ['value' => 'any', 'label' => 'Indifférent', 'order' => 1],
                    ['value' => 'M',   'label' => 'Homme',       'order' => 2],
                    ['value' => 'F',   'label' => 'Femme',       'order' => 3],
                ],
            ],

        ];

        foreach ($groups as $key => $config) {
            $group = ParameterGroup::firstOrCreate(
                ['key' => $key],
                [
                    'label' => $config['label'],
                    'is_system' => $config['system'] ?? false,
                    'is_active' => true,
                ]
            );

            foreach ($config['values'] as $v) {
                $group->values()->firstOrCreate(
                    ['value' => $v['value']],
                    ['label' => $v['label'], 'order' => $v['order'], 'is_active' => true]
                );
            }
        }
    }
}
