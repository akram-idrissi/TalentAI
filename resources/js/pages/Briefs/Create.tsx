import Select from '@/components/Select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useForm } from '@inertiajs/react';
type Props = {
    contractTypes: { value: string; label: string }[];
    genderPrefs: { value: string; label: string }[];
};
export default function CreateBrief({ contractTypes, genderPrefs }: Props) {
    console.log(contractTypes, genderPrefs);
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        sector: '',
        contract_type: '',
        location: '',
        salary_range: '',
        min_experience_years: '',
        education_level: '',
        gender_pref: '',
        age_range: '',
        mission_description: '',
        required_skills: '',
        soft_skills: '',
        scoring_weights: {
            experience: 0,
            education: 0,
            sector: 0,
            soft_skills: 0,
            location: 0,
        },
        status: 'draft',
    });
    console.log(data);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(route('briefs.store'));
    }

    const inputClass =
        'w-full bg-gray-100 dark:bg-[#17171F] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-secondary focus:ring-1 focus:ring-secondary hover:border-secondary transition';

    const cardClass = 'bg-white dark:bg-[#111118] p-4 rounded-xl border border-gray-200 dark:border-white/10';

    const labelClass = 'text-xs text-gray-500 dark:text-gray-400';

    return (
        <AppSidebarLayout>
            <div className="min-h-screen bg-gray-50 p-8 text-gray-900 dark:bg-[#0A0A0F] dark:text-white">
                {/* HEADER */}
                <div className="mb-6">
                    <p className="text-xs text-gray-500">Sourcing › Nouveau brief</p>
                    <h1 className="text-secondary text-2xl font-bold">Créer un brief de recrutement</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Renseignez les critères · L'IA les utilisera pour analyser les candidats
                    </p>
                </div>

                <form onSubmit={submit} className="grid grid-cols-2 gap-6">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Informations du poste</h2>

                            <input
                                className={inputClass}
                                placeholder="Intitulé du poste"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}

                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <input
                                    className={inputClass}
                                    placeholder="Secteur"
                                    value={data.sector}
                                    onChange={(e) => setData('sector', e.target.value)}
                                />
                                {errors.sector && <p className="text-xs text-red-500">{errors.sector}</p>}
                                <Select
                                    value={data.contract_type}
                                    onChange={(value: string) => setData('contract_type', value)}
                                    placeholder="Type de contrat"
                                    // options={[
                                    //   { value: "CDI", label: "CDI" },
                                    //   { value: "CDD", label: "CDD" },
                                    //   { value: "Freelance", label: "Freelance" },
                                    //   { value: "Stage", label: "Stage" },
                                    // ]}
                                    options={contractTypes}
                                />
                                {errors.contract_type && <p className="text-xs text-red-500">{errors.contract_type}</p>}

                                <input
                                    className={inputClass}
                                    placeholder="Localisation"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                />
                                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}

                                <input
                                    className={inputClass}
                                    placeholder="Salaire"
                                    value={data.salary_range}
                                    onChange={(e) => setData('salary_range', e.target.value)}
                                />
                                {errors.salary_range && <p className="text-xs text-red-500">{errors.salary_range}</p>}
                            </div>
                        </div>

                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Critères candidat</h2>

                            <input
                                className={inputClass}
                                placeholder="Expérience (années)"
                                value={data.min_experience_years}
                                onChange={(e) => setData('min_experience_years', e.target.value)}
                            />
                            {errors.min_experience_years && <p className="text-xs text-red-500">{errors.min_experience_years}</p>}

                            <input
                                className={`${inputClass} mt-3`}
                                placeholder="Niveau d'études"
                                value={data.education_level}
                                onChange={(e) => setData('education_level', e.target.value)}
                            />
                            {errors.education_level && <p className="text-xs text-red-500">{errors.education_level}</p>}

                            <input
                                className={`${inputClass} mt-3`}
                                placeholder="Langues"
                                value={data.required_skills}
                                onChange={(e) => setData('required_skills', e.target.value)}
                            />
                            {errors.required_skills && <p className="text-xs text-red-500">{errors.required_skills}</p>}

                            <input
                                className={`${inputClass} mt-3`}
                                placeholder="Age préféré"
                                value={data.age_range}
                                onChange={(e) => setData('age_range', e.target.value)}
                            />
                            {errors.age_range && <p className="text-xs text-red-500">{errors.age_range}</p>}

                            <div className="mt-3">
                                <Select
                                    value={data.gender_pref}
                                    onChange={(value: string) => setData('gender_pref', value)}
                                    placeholder="Préférence de genre"
                                    // options={[
                                    //   { value: "M", label: "Homme" },
                                    //   { value: "F", label: "Femme" },
                                    // ]}
                                    options={genderPrefs}
                                />
                                {errors.gender_pref && <p className="text-xs text-red-500">{errors.gender_pref}</p>}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Description</h2>

                            <textarea
                                className={inputClass + ' min-h-[100px]'}
                                placeholder="Mission principale"
                                value={data.mission_description}
                                onChange={(e) => setData('mission_description', e.target.value)}
                            />
                            {errors.mission_description && <p className="text-xs text-red-500">{errors.mission_description}</p>}

                            <textarea
                                className={inputClass + ' mt-3'}
                                placeholder="Soft skills"
                                value={data.soft_skills}
                                onChange={(e) => setData('soft_skills', e.target.value)}
                            />
                            {errors.soft_skills && <p className="text-xs text-red-500">{errors.soft_skills}</p>}
                        </div>

                        {/* SCORING */}
                        <div className={cardClass}>
                            <h2 className="mb-3 font-semibold">Poids scoring IA</h2>

                            {Object.keys(data.scoring_weights).map((key) => (
                                <div key={key} className="mb-3">
                                    <label className={labelClass}>{key}</label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={data.scoring_weights[key as keyof typeof data.scoring_weights]}
                                        onChange={(e) =>
                                            setData('scoring_weights', {
                                                ...data.scoring_weights,
                                                [key]: Number(e.target.value),
                                            })
                                        }
                                    />
                                    {errors.scoring_weights?.[key] && <p className="text-xs text-red-500">{errors.scoring_weights[key]}</p>}
                                </div>
                            ))}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3">
                            <button type="button" className="w-1/2 rounded-lg border border-gray-300 py-2 dark:border-white/10">
                                Brouillon
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-1/2 rounded-lg bg-[#6C63FF] py-2 font-semibold text-white hover:bg-[#5a52ff]"
                            >
                                Créer brief
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
