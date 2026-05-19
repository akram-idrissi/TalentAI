<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BriefSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('briefs')->insert([
            [
                'id' => (string) Str::uuid(),
                'title' => 'React Developer',
                'mission_description' => 'Développement et maintenance des applications React.',
                'required_skills' => 'React, TypeScript, API REST',
                'scoring_weights' => json_encode([
                    'skills' => 40,
                    'experience' => 30,
                    'education' => 20,
                    'communication' => 10,
                ]),
                'sector' => 'Informatique / Tech',
                'contract_type' => 'CDI',
                'location' => 'Remote',
                'min_experience_years' => 2,
                'education_level' => 'Bac+3 / Bac+5',
                'status' => 'active',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Fullstack Developer',
                'mission_description' => 'Création d’applications web Laravel et React.',
                'required_skills' => 'Laravel, React, MySQL, TypeScript',
                'scoring_weights' => json_encode([
                    'skills' => 40,
                    'experience' => 30,
                    'education' => 20,
                    'communication' => 10,
                ]),
                'sector' => 'Informatique / Tech',
                'contract_type' => 'CDI',
                'location' => 'Hybride (Casablanca)',
                'min_experience_years' => 4,
                'education_level' => 'Bac+5',
                'status' => 'active',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
