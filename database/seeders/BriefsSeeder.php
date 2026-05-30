<?php

namespace Database\Seeders;

use App\Models\Brief;
use App\Models\User;
use Illuminate\Database\Seeder;

class BriefsSeeder extends Seeder
{
    public function run(): void
    {
        $recruiter = User::whereHas('roles', fn ($q) => $q->where('name', 'recruiter'))->first();
        $admin = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->first();

        $briefs = [
            [
                'created_by' => $recruiter->id,
                'title' => 'Développeur Full-Stack Laravel / Vue.js',
                'sector' => 'Technologie',
                'contract_type' => 'CDI',
                'location' => 'Casablanca, Maroc',
                'salary_range' => '15000-25000 MAD',
                'min_experience_years' => 3,
                'education_level' => 'Bac+5',
                'languages' => 'Français, Anglais',
                'seniority_level' => 'Mid-level',
                'target_companies' => 'Capgemini, IBM, CGI',
                'gender_pref' => 'any',
                'age_range' => '25-40',
                'mission_description' => 'Développement et maintenance d\'applications web métier pour des clients grands comptes. Vous intégrerez une équipe agile de 6 développeurs.',
                'required_skills' => 'Laravel, Vue.js, MySQL, REST API, Git',
                'soft_skills' => 'Autonomie, esprit d\'équipe, communication',
                'scoring_weights' => ['experience' => 40, 'education' => 20, 'sector' => 20, 'soft_skills' => 10, 'location' => 10],
                'status' => 'active',
            ],
            [
                'created_by' => $recruiter->id,
                'title' => 'Data Scientist – NLP & Machine Learning',
                'sector' => 'Intelligence Artificielle',
                'contract_type' => 'CDI',
                'location' => 'Rabat, Maroc',
                'salary_range' => '20000-35000 MAD',
                'min_experience_years' => 4,
                'education_level' => 'Bac+5 / Doctorat',
                'languages' => 'Français, Anglais, Arabe',
                'seniority_level' => 'Senior',
                'target_companies' => 'OCP, Maroc Telecom, HPS',
                'gender_pref' => 'any',
                'age_range' => null,
                'mission_description' => 'Conception et déploiement de modèles NLP pour l\'analyse de documents RH et financiers. Travail en étroite collaboration avec les équipes produit.',
                'required_skills' => 'Python, Scikit-learn, TensorFlow, spaCy, SQL, Docker',
                'soft_skills' => 'Curiosité intellectuelle, rigueur, présentation des résultats',
                'scoring_weights' => ['experience' => 30, 'education' => 15, 'sector' => 30, 'soft_skills' => 15, 'location' => 10],
                'status' => 'sourcing',
            ],
            [
                'created_by' => $admin->id,
                'title' => 'Responsable Ressources Humaines',
                'sector' => 'Ressources Humaines',
                'contract_type' => 'CDI',
                'location' => 'Casablanca, Maroc',
                'salary_range' => '18000-28000 MAD',
                'min_experience_years' => 5,
                'education_level' => 'Bac+5 RH ou équivalent',
                'languages' => 'Français, Anglais',
                'seniority_level' => 'Senior',
                'target_companies' => null,
                'gender_pref' => 'any',
                'age_range' => '30-45',
                'mission_description' => 'Pilotage de la stratégie RH d\'une PME de 150 collaborateurs : recrutement, formation, GPEC, relations sociales.',
                'required_skills' => 'Droit du travail marocain, SIRH, recrutement, gestion de la paie',
                'soft_skills' => 'Leadership, empathie, discrétion, sens de la négociation',
                'scoring_weights' => ['experience' => 35, 'education' => 20, 'sector' => 15, 'soft_skills' => 20, 'location' => 10],
                'status' => 'interviews',
            ],
            [
                'created_by' => $recruiter->id,
                'title' => 'Stagiaire Marketing Digital',
                'sector' => 'Marketing',
                'contract_type' => 'Stage',
                'location' => 'Marrakech, Maroc',
                'salary_range' => '3000-5000 MAD',
                'min_experience_years' => 0,
                'education_level' => 'Bac+3 minimum',
                'languages' => 'Français, Anglais',
                'seniority_level' => 'Junior',
                'target_companies' => null,
                'gender_pref' => 'any',
                'age_range' => '20-26',
                'mission_description' => 'Gestion des réseaux sociaux, création de contenu et support aux campagnes d\'emailing dans une startup e-commerce en forte croissance.',
                'required_skills' => 'Community management, Canva, Google Analytics, emailing',
                'soft_skills' => 'Créativité, proactivité, sens du détail',
                'scoring_weights' => ['experience' => 20, 'education' => 25, 'sector' => 20, 'soft_skills' => 20, 'location' => 15],
                'status' => 'active',
            ],
            [
                'created_by' => $admin->id,
                'title' => 'Ingénieur DevOps – Cloud & CI/CD',
                'sector' => 'Technologie',
                'contract_type' => 'Freelance',
                'location' => 'Remote',
                'salary_range' => '600-900 EUR/jour',
                'min_experience_years' => 5,
                'education_level' => 'Bac+5 Informatique',
                'languages' => 'Français, Anglais',
                'seniority_level' => 'Senior',
                'target_companies' => null,
                'gender_pref' => 'any',
                'age_range' => null,
                'mission_description' => 'Mise en place et optimisation des pipelines CI/CD, gestion de l\'infrastructure cloud AWS, monitoring et sécurité.',
                'required_skills' => 'AWS, Terraform, Docker, Kubernetes, GitHub Actions, Linux',
                'soft_skills' => 'Autonomie, documentation, communication asynchrone',
                'scoring_weights' => ['experience' => 30, 'education' => 10, 'sector' => 35, 'soft_skills' => 15, 'location' => 10],
                'status' => 'draft',
            ],
        ];

        foreach ($briefs as $data) {
            Brief::updateOrCreate(
                ['title' => $data['title'], 'created_by' => $data['created_by']],
                $data
            );
        }
    }
}
