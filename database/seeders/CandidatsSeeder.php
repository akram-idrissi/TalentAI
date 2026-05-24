<?php

namespace Database\Seeders;

use App\Models\Candidat;
use Illuminate\Database\Seeder;

class CandidatsSeeder extends Seeder
{
    public function run(): void
    {
        $candidats = [
            [
                'linkedin_url' => 'https://linkedin.com/in/adam-el-ouali',
                'full_name' => 'Adam El Ouali',
                'headline' => 'Senior Full-Stack Developer | Laravel & Vue.js',
                'location' => 'Casablanca, Morocco',
                'summary' => 'Experienced full-stack developer with 6+ years building scalable web applications for fintech and e-commerce companies.',
                'skills' => ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Docker', 'REST APIs'],
                'current_company' => 'TechVentures MA',
                'current_title' => 'Senior Software Engineer',
                'experience_years' => 6.5,
                'education_level' => 'bachelor',
                'sector' => 'Technology',
                'open_to_work' => true,
                'source' => 'linkedin',
                'source_url' => 'https://linkedin.com/in/adam-el-ouali',
                'status' => 'sourced',
                'raw_data' => ['imported_at' => '2026-04-01', 'profile_views' => 340],
            ],
            [
                'linkedin_url' => 'https://linkedin.com/in/fatima-zahra-benhali',
                'full_name' => 'Fatima-Zahra Benhali',
                'headline' => 'Data Scientist | Python & Machine Learning',
                'location' => 'Rabat, Morocco',
                'summary' => 'Data scientist with 4 years of experience in NLP, recommendation systems, and predictive analytics.',
                'skills' => ['Python', 'TensorFlow', 'scikit-learn', 'SQL', 'Spark', 'NLP'],
                'current_company' => 'DataMinds Africa',
                'current_title' => 'Data Scientist',
                'experience_years' => 4.0,
                'education_level' => 'master',
                'sector' => 'Data & AI',
                'open_to_work' => true,
                'source' => 'apify',
                'source_url' => 'https://linkedin.com/in/fatima-zahra-benhali',
                'status' => 'contacted',
                'raw_data' => ['imported_at' => '2026-04-05', 'profile_views' => 512],
            ],
            [
                'linkedin_url' => 'https://linkedin.com/in/yassine-moussaoui',
                'full_name' => 'Yassine Moussaoui',
                'headline' => 'DevOps Engineer | Kubernetes & CI/CD',
                'location' => 'Marrakech, Morocco',
                'summary' => 'DevOps engineer specializing in cloud infrastructure, automation, and container orchestration for high-availability platforms.',
                'skills' => ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Jenkins', 'Ansible'],
                'current_company' => 'CloudOps SARL',
                'current_title' => 'DevOps Engineer',
                'experience_years' => 5.0,
                'education_level' => 'bachelor',
                'sector' => 'Cloud & Infrastructure',
                'open_to_work' => false,
                'source' => 'apify',
                'source_url' => 'https://linkedin.com/in/yassine-moussaoui',
                'status' => 'interview',
                'raw_data' => ['imported_at' => '2026-04-10', 'profile_views' => 289],
            ],
            [
                'linkedin_url' => 'https://linkedin.com/in/salma-rifai',
                'full_name' => 'Salma Rifai',
                'headline' => 'Product Manager | SaaS & Mobile',
                'location' => 'Casablanca, Morocco',
                'summary' => 'Product manager with 7 years leading cross-functional teams to deliver SaaS products with strong user adoption metrics.',
                'skills' => ['Product Strategy', 'Agile', 'Jira', 'User Research', 'Roadmapping', 'Figma'],
                'current_company' => 'Innova Digital',
                'current_title' => 'Senior Product Manager',
                'experience_years' => 7.0,
                'education_level' => 'master',
                'sector' => 'Product Management',
                'open_to_work' => true,
                'source' => 'linkedin',
                'source_url' => 'https://linkedin.com/in/salma-rifai',
                'status' => 'recommended',
                'raw_data' => ['imported_at' => '2026-04-12', 'profile_views' => 720],
            ],
            [
                'linkedin_url' => 'https://linkedin.com/in/omar-tlemcani',
                'full_name' => 'Omar Tlemcani',
                'headline' => 'Backend Engineer | Node.js & Microservices',
                'location' => 'Fès, Morocco',
                'summary' => 'Backend engineer with expertise in building microservices architectures and high-throughput APIs using Node.js and Go.',
                'skills' => ['Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'gRPC'],
                'current_company' => 'Nexus Solutions',
                'current_title' => 'Backend Engineer',
                'experience_years' => 3.5,
                'education_level' => 'bachelor',
                'sector' => 'Technology',
                'open_to_work' => false,
                'source' => 'apify',
                'source_url' => 'https://linkedin.com/in/omar-tlemcani',
                'status' => 'offer',
                'raw_data' => ['imported_at' => '2026-04-15', 'profile_views' => 198],
            ],
            [
                'linkedin_url' => 'https://linkedin.com/in/hind-laghrissi',
                'full_name' => 'Hind Laghrissi',
                'headline' => 'UX/UI Designer | Design Systems & Accessibility',
                'location' => 'Agadir, Morocco',
                'summary' => 'Designer with 5 years building design systems and accessible interfaces for web and mobile apps in healthcare and fintech.',
                'skills' => ['Figma', 'Adobe XD', 'Sketch', 'CSS', 'Accessibility', 'Prototyping'],
                'current_company' => 'PixelCraft Studio',
                'current_title' => 'Senior UX Designer',
                'experience_years' => 5.0,
                'education_level' => 'bachelor',
                'sector' => 'Design',
                'open_to_work' => true,
                'source' => 'linkedin',
                'source_url' => 'https://linkedin.com/in/hind-laghrissi',
                'status' => 'rejected',
                'raw_data' => ['imported_at' => '2026-04-18', 'profile_views' => 410],
            ],
        ];

        foreach ($candidats as $data) {
            Candidat::updateOrCreate(
                ['linkedin_url' => $data['linkedin_url']],
                $data
            );
        }
    }
}
