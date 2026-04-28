import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Link } from '@inertiajs/react';
type ScoringWeights = {
    experience: number;
    education: number;
    sector: number;
    soft_skills: number;
    location: number;
};

type Brief = {
    id: number;
    title: string;
    sector: string;
    contract_type: string;
    salary_range: string;
    location: string;
    status: string;
    created_at: string;
    created_by?: string;

    min_experience_years: string;
    education_level: string;
    gender_pref: string;
    age_range: string;

    mission_description?: string;
    required_skills: string;
    soft_skills: string;

    scoring_weights?: ScoringWeights;
};

type Props = {
    brief: Brief;
};

export default function ShowBrief({ brief }: Props) {
    const cardClass = 'bg-white dark:bg-[#111118] p-5 rounded-xl border border-gray-200 dark:border-white/10';

    const labelClass = 'text-xs text-gray-500 dark:text-gray-400 mb-1';

    const valueClass = 'text-sm font-medium text-gray-900 dark:text-white';

    return (
        <AppSidebarLayout>
            <div className="min-h-screen bg-gray-50 p-8 text-gray-900 dark:bg-[#0A0A0F] dark:text-white">
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Sourcing › Détails brief</p>
                        <h1 className="text-secondary text-2xl font-bold">{brief.title}</h1>
                    </div>

                    {/* BACK BUTTON */}
                    <Link href={route('briefs.index')} className="bg-secondary rounded-lg px-4 py-2 text-white">
                        ← Retour
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* LEFT */}
                    <div className="space-y-4">
                        {/* INFO */}
                        <div className={cardClass}>
                            <h2 className="mb-4 font-semibold">Informations du poste</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className={labelClass}>Titre</p>
                                    <p className={valueClass}>{brief.title}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Secteur</p>
                                    <p className={valueClass}>{brief.sector}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Type de contrat</p>
                                    <p className={valueClass}>{brief.contract_type}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Localisation</p>
                                    <p className={valueClass}>{brief.location}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Salaire</p>
                                    <p className={valueClass}>{brief.salary_range}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Statut</p>
                                    <span className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-600">{brief.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* CRITERES */}
                        <div className={cardClass}>
                            <h2 className="mb-4 font-semibold">Critères candidat</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className={labelClass}>Expérience</p>
                                    <p className={valueClass}>{brief.min_experience_years} ans</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Niveau d'étude</p>
                                    <p className={valueClass}>{brief.education_level}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Age</p>
                                    <p className={valueClass}>{brief.age_range}</p>
                                </div>

                                <div>
                                    <p className={labelClass}>Genre</p>
                                    <p className={valueClass}>{brief.gender_pref}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className={labelClass}>Compétences</p>
                                <p className={valueClass}>{brief.required_skills}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        {/* DESCRIPTION */}
                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Description</h2>

                            <p className="text-sm text-gray-700 dark:text-gray-300">{brief.mission_description || '—'}</p>

                            <div className="mt-4">
                                <p className={labelClass}>Soft skills</p>
                                <p className={valueClass}>{brief.soft_skills}</p>
                            </div>
                        </div>

                        {/* SCORING */}
                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Scoring IA</h2>

                            {brief.scoring_weights &&
                                Object.entries(brief.scoring_weights as ScoringWeights).map(([key, value]) => (
                                    <div key={key} className="mb-2 flex justify-between text-sm">
                                        <span className="text-gray-500 capitalize">{key}</span>
                                        <span className="font-medium">{value}%</span>
                                    </div>
                                ))}
                        </div>

                        {/* META */}
                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Informations système</h2>

                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-gray-500">Créé par :</span> {brief.created_by || '—'}
                                </p>
                                <p>
                                    <span className="text-gray-500">Date :</span> {brief.created_at}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
