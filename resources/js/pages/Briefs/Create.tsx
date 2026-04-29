import Select from '@/components/Select';
import { useI18n } from '@/hooks/useI18n';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
type ScoringWeights = {
    experience: number;
    education: number;
    sector: number;
    soft_skills: number;
    location: number;
};

type FormData = {
    title: string;
    sector: string;
    contract_type: string;
    location: string;
    salary_range: string;
    min_experience_years: string;
    education_level: string;
    languages: string;
    gender_pref: string;
    age_range: string;
    mission_description: string;
    required_skills: string;
    soft_skills: string;
    scoring_weights: ScoringWeights;
};

type Props = {
    contractTypes: { value: string; label: string }[];
    genderPrefs: { value: string; label: string }[];
};

function validateForm(data: FormData, t: (path: string) => string): Partial<Record<keyof FormData | string, string>> {
    const errs: Partial<Record<string, string>> = {};

    if (!data.title.trim()) {
        errs.title = t('briefs.validation.required');
    } else if (data.title.trim().length < 3) {
        errs.title = t('briefs.validation.min_length').replace(':min', '3');
    } else if (data.title.trim().length > 100) {
        errs.title = t('briefs.validation.max_length').replace(':max', '100');
    }

    if (!data.sector.trim()) {
        errs.sector = t('briefs.validation.required');
    }

    if (!data.contract_type) {
        errs.contract_type = t('briefs.validation.required');
    }

    if (!data.location.trim()) {
        errs.location = t('briefs.validation.required');
    }

    if (data.salary_range && !/^\d+(\s*[-–]\s*\d+)?(\s*(€|EUR|MAD|TND|DZD|FCFA|USD))?$/.test(data.salary_range.trim())) {
        errs.salary_range = t('briefs.validation.salary_format');
    }

    if (!data.min_experience_years.trim()) {
        errs.min_experience_years = t('briefs.validation.required');
    } else if (isNaN(Number(data.min_experience_years)) || Number(data.min_experience_years) < 0) {
        errs.min_experience_years = t('briefs.validation.positive_number');
    } else if (Number(data.min_experience_years) > 50) {
        errs.min_experience_years = t('briefs.validation.max_value').replace(':max', '50');
    }

    if (!data.education_level.trim()) {
        errs.education_level = t('briefs.validation.required');
    }

    if (!data.mission_description.trim()) {
        errs.mission_description = t('briefs.validation.required');
    } else if (data.mission_description.trim().length < 20) {
        errs.mission_description = t('briefs.validation.min_length').replace(':min', '20');
    } else if (data.mission_description.trim().length > 2000) {
        errs.mission_description = t('briefs.validation.max_length').replace(':max', '2000');
    }

    if (data.age_range && !/^\d+(\s*[-–]\s*\d+)?$/.test(data.age_range.trim())) {
        errs.age_range = t('briefs.validation.age_format');
    }

    const weights = Object.values(data.scoring_weights);
    const total = weights.reduce((a, b) => a + b, 0);
    const allValid = weights.every((w) => w >= 0 && w <= 100);

    if (!allValid) {
        errs['scoring_weights'] = t('briefs.validation.weight_range');
    } else if (total !== 100) {
        errs['scoring_weights'] = t('briefs.validation.weight_total').replace(':total', String(total));
    }
    if (!data.required_skills.trim()) {
        errs.required_skills = t('briefs.validation.required');
    }

    return errs;
}

export default function CreateBrief({ contractTypes, genderPrefs }: Props) {
    const { t } = useI18n();
    const statusRef = useRef<'active' | 'draft'>('active');

    const { data, setData, transform, post, processing, errors, setError, clearErrors } = useForm<FormData>({
        title: '',
        sector: '',
        contract_type: '',
        location: '',
        salary_range: '',
        min_experience_years: '',
        education_level: '',
        languages: '',
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
    });
    useEffect(() => {
        transform((d) => ({ ...d, status: statusRef.current }));
    }, []);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        clearErrors();

        const clientErrors = validateForm(data, t);
        if (Object.keys(clientErrors).length > 0) {
            Object.entries(clientErrors).forEach(([field, message]) => {
                setError(field as keyof FormData, message as string);
            });
            return;
        }
        statusRef.current = 'active';
        post(route('briefs.store'));
    }

    function saveDraft() {
        clearErrors();

        const clientErrors = validateForm(data, t);
        if (Object.keys(clientErrors).length > 0) {
            Object.entries(clientErrors).forEach(([field, message]) => {
                setError(field as keyof FormData, message as string);
            });
            return;
        }
        statusRef.current = 'draft';
        post(route('briefs.store'));
    }

    const weightTotal = Object.values(data.scoring_weights).reduce((a, b) => a + b, 0);
    const weightColor = weightTotal === 100 ? 'text-green-500' : weightTotal > 100 ? 'text-red-500' : 'text-yellow-500';

    const inputClass =
        'w-full bg-gray-100 dark:bg-[#17171F] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-secondary focus:ring-1 focus:ring-secondary hover:border-secondary transition';

    const inputErrorClass =
        'w-full bg-gray-100 dark:bg-[#17171F] border border-red-400 dark:border-red-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition';

    const cardClass = 'bg-white dark:bg-[#111118] p-4 rounded-xl border border-gray-200 dark:border-white/10';
    const labelClass = 'text-xs text-gray-500 dark:text-gray-400';
    const errorClass = 'mt-1 text-xs text-red-500';

    const fieldInput = (hasError: boolean) => (hasError ? inputErrorClass : inputClass);

    return (
        <>
            <Head title={t('briefs.create_briefs.create.title')} />
            <AppSidebarLayout>
                <div className="min-h-screen bg-gray-50 p-8 text-gray-900 dark:bg-[#0A0A0F] dark:text-white">
                    {/* HEADER */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500">{t('briefs.create_briefs.breadcrumb')}</p>
                            <h1 className="text-secondary text-2xl font-bold">{t('briefs.create_briefs.create.title')}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('briefs.create_briefs.create.subtitle')}</p>
                        </div>

                        <Link
                            href={route('briefs.index')}
                            className="bg-secondary flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-white transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('briefs.create_briefs.actions.back')}
                        </Link>
                    </div>

                    <form onSubmit={submit} noValidate className="grid grid-cols-2 gap-6">
                        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
                        <div className="space-y-4">
                            {/* Informations du poste */}
                            <div className={cardClass}>
                                <h2 className="mb-3 font-semibold">{t('briefs.create_briefs.create.sections.position')}</h2>

                                <div>
                                    <label className={labelClass}>
                                        {t('briefs.create_briefs.fields.title')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className={`mt-1 ${fieldInput(!!errors.title)}`}
                                        placeholder={t('briefs.create_briefs.fields.title_placeholder')}
                                        value={data.title}
                                        maxLength={100}
                                        onChange={(e) => setData('title', e.target.value)}
                                        aria-invalid={!!errors.title}
                                        aria-describedby={errors.title ? 'title-error' : undefined}
                                    />
                                    {errors.title && (
                                        <p id="title-error" className={errorClass}>
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    {/* Sector */}
                                    <div>
                                        <label className={labelClass}>
                                            {t('briefs.create_briefs.fields.sector')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className={`mt-1 ${fieldInput(!!errors.sector)}`}
                                            placeholder={t('briefs.create_briefs.fields.sector_placeholder')}
                                            value={data.sector}
                                            onChange={(e) => setData('sector', e.target.value)}
                                            aria-invalid={!!errors.sector}
                                        />
                                        {errors.sector && <p className={errorClass}>{errors.sector}</p>}
                                    </div>

                                    {/* Contract type */}
                                    <div>
                                        <label className={labelClass}>
                                            {t('briefs.create_briefs.fields.contract_type')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <Select
                                                value={data.contract_type}
                                                onChange={(value: string) => setData('contract_type', value)}
                                                placeholder={t('briefs.create_briefs.fields.contract_type_placeholder')}
                                                options={contractTypes}
                                            />
                                        </div>
                                        {errors.contract_type && <p className={errorClass}>{errors.contract_type}</p>}
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className={labelClass}>
                                            {t('briefs.create_briefs.fields.location')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            className={`mt-1 ${fieldInput(!!errors.location)}`}
                                            placeholder={t('briefs.create_briefs.fields.location_placeholder')}
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            aria-invalid={!!errors.location}
                                        />
                                        {errors.location && <p className={errorClass}>{errors.location}</p>}
                                    </div>

                                    {/* Salary */}
                                    <div>
                                        <label className={labelClass}>{t('briefs.create_briefs.fields.salary_range')}</label>
                                        <input
                                            className={`mt-1 ${fieldInput(!!errors.salary_range)}`}
                                            placeholder={t('briefs.create_briefs.fields.salary_range_placeholder')}
                                            value={data.salary_range}
                                            onChange={(e) => setData('salary_range', e.target.value)}
                                            aria-invalid={!!errors.salary_range}
                                        />
                                        {errors.salary_range && <p className={errorClass}>{errors.salary_range}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Critères candidat */}
                            <div className={cardClass}>
                                <h2 className="mb-3 font-semibold">{t('briefs.create_briefs.create.sections.candidate')}</h2>

                                {/* Experience */}
                                <div>
                                    <label className={labelClass}>
                                        {t('briefs.create_briefs.fields.min_experience_years')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={50}
                                        className={`mt-1 ${fieldInput(!!errors.min_experience_years)}`}
                                        placeholder={t('briefs.create_briefs.fields.min_experience_years_placeholder')}
                                        value={data.min_experience_years}
                                        onChange={(e) => setData('min_experience_years', e.target.value)}
                                        aria-invalid={!!errors.min_experience_years}
                                    />
                                    {errors.min_experience_years && <p className={errorClass}>{errors.min_experience_years}</p>}
                                </div>

                                {/* Education */}
                                <div className="mt-3">
                                    <label className={labelClass}>
                                        {t('briefs.create_briefs.fields.education_level')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className={`mt-1 ${fieldInput(!!errors.education_level)}`}
                                        placeholder={t('briefs.create_briefs.fields.education_level_placeholder')}
                                        value={data.education_level}
                                        onChange={(e) => setData('education_level', e.target.value)}
                                        aria-invalid={!!errors.education_level}
                                    />
                                    {errors.education_level && <p className={errorClass}>{errors.education_level}</p>}
                                </div>

                                {/* Languages */}
                                <div className="mt-3">
                                    <label className={labelClass}>{t('briefs.create_briefs.fields.languages')}</label>
                                    <input
                                        className={`mt-1 ${fieldInput(!!errors.languages)}`}
                                        placeholder={t('briefs.create_briefs.fields.languages_placeholder')}
                                        value={data.languages}
                                        onChange={(e) => setData('languages', e.target.value)}
                                    />
                                    {errors.languages && <p className={errorClass}>{errors.languages}</p>}
                                </div>

                                {/* Age range */}
                                <div className="mt-3">
                                    <label className={labelClass}>{t('briefs.create_briefs.fields.age_range')}</label>
                                    <input
                                        className={`mt-1 ${fieldInput(!!errors.age_range)}`}
                                        placeholder={t('briefs.create_briefs.fields.age_range_placeholder')}
                                        value={data.age_range}
                                        onChange={(e) => setData('age_range', e.target.value)}
                                        aria-invalid={!!errors.age_range}
                                    />
                                    {errors.age_range && <p className={errorClass}>{errors.age_range}</p>}
                                </div>

                                {/* Gender pref */}
                                <div className="mt-3">
                                    <label className={labelClass}>{t('briefs.create_briefs.fields.gender_pref')}</label>
                                    <div className="mt-1">
                                        <Select
                                            value={data.gender_pref}
                                            onChange={(value: string) => setData('gender_pref', value)}
                                            placeholder={t('briefs.create_briefs.fields.gender_pref_placeholder')}
                                            options={genderPrefs}
                                        />
                                    </div>
                                    {errors.gender_pref && <p className={errorClass}>{errors.gender_pref}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN ────────────────────────────────────── */}
                        <div className="space-y-4">
                            {/* Description */}
                            <div className={cardClass}>
                                <h2 className="mb-3 font-semibold">{t('briefs.create_briefs.create.sections.description')}</h2>

                                <div>
                                    <label className={labelClass}>
                                        {t('briefs.create_briefs.fields.mission_description')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className={`mt-1 min-h-[100px] ${fieldInput(!!errors.mission_description)}`}
                                        placeholder={t('briefs.create_briefs.fields.mission_description_placeholder')}
                                        value={data.mission_description}
                                        maxLength={2000}
                                        onChange={(e) => setData('mission_description', e.target.value)}
                                        aria-invalid={!!errors.mission_description}
                                    />
                                    <div className="flex justify-between">
                                        {errors.mission_description ? <p className={errorClass}>{errors.mission_description}</p> : <span />}
                                        <span className="text-xs text-gray-400">{data.mission_description.length}/2000</span>
                                    </div>
                                </div>
                                {/* Technical skills */}
                                <div className="mt-3">
                                    <label className={labelClass}>
                                        {t('briefs.create_briefs.fields.required_skills')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className={`mt-1 ${fieldInput(!!errors.required_skills)}`}
                                        placeholder={t('briefs.create_briefs.fields.required_skills_placeholder')}
                                        value={data.required_skills}
                                        onChange={(e) => setData('required_skills', e.target.value)}
                                        aria-invalid={!!errors.required_skills}
                                    />
                                    {errors.required_skills && <p className={errorClass}>{errors.required_skills}</p>}
                                </div>
                                {/* Soft skills */}
                                <div className="mt-3">
                                    <label className={labelClass}>{t('briefs.create_briefs.fields.soft_skills')}</label>
                                    <textarea
                                        className={`mt-1 ${fieldInput(!!errors.soft_skills)}`}
                                        placeholder={t('briefs.create_briefs.fields.soft_skills_placeholder')}
                                        value={data.soft_skills}
                                        onChange={(e) => setData('soft_skills', e.target.value)}
                                    />
                                    {errors.soft_skills && <p className={errorClass}>{errors.soft_skills}</p>}
                                </div>
                            </div>

                            {/* Scoring weights */}
                            <div className={cardClass}>
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="font-semibold">{t('briefs.create_briefs.create.sections.scoring')}</h2>
                                    <span className={`text-xs font-semibold ${weightColor}`}>
                                        {t('briefs.create_briefs.scoring.total')}: {weightTotal}/100
                                    </span>
                                </div>

                                {(Object.keys(data.scoring_weights) as Array<keyof ScoringWeights>).map((key) => (
                                    <div key={key} className="mb-3">
                                        <label className={labelClass}>{t(`briefs.create_briefs.scoring.${key}`)}</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                className={`${inputClass} flex-1`}
                                                value={data.scoring_weights[key]}
                                                onChange={(e) =>
                                                    setData('scoring_weights', {
                                                        ...data.scoring_weights,
                                                        [key]: Math.min(100, Math.max(0, Number(e.target.value))),
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-gray-400">%</span>
                                        </div>
                                    </div>
                                ))}

                                {errors['scoring_weights'] && <p className={errorClass}>{errors['scoring_weights'] as string}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={saveDraft}
                                    disabled={processing}
                                    className="w-1/2 rounded-lg border border-gray-300 py-2 transition hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                                >
                                    {t('briefs.create_briefs.actions.save_draft')}
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-1/2 rounded-lg bg-[#6C63FF] py-2 font-semibold text-white transition hover:bg-[#5a52ff] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? t('briefs.create_briefs.actions.creating') : t('briefs.create_briefs.actions.create')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </AppSidebarLayout>
        </>
    );
}
