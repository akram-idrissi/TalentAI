import FormCard from '@/components/briefs/FormCard';
import { FormField, inputCls, textareaCls } from '@/components/briefs/FormField';
import ScoringSlider from '@/components/briefs/ScoringSlider';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { BriefFormData, CreateBriefProps, SelectOption } from '@/types/brief';
import { validateBriefForm } from '@/utils/briefCreationValidation';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactSelect from 'react-select';

export default function CreateBrief({ params }: CreateBriefProps) {
    const { sectors, education_levels, experience_options, age_ranges, languages, seniority_levels, contract_types, gender_prefs } = params;
    const { t } = useI18n();
    const statusRef = useRef<'active' | 'draft'>('active');

    const { data, setData, transform, post, processing, errors, setError, clearErrors } = useForm<BriefFormData>({
        title: '',
        sector: '',
        contract_type: '',
        location: '',
        salary_range: '',
        min_experience_years: '',
        education_level: '',
        languages: '',
        seniority_level: '',
        target_companies: '',
        gender_pref: '',
        age_range: '',
        mission_description: '',
        required_skills: '',
        soft_skills: '',
        search_prompt: '',
        scoring_weights: { experience: 50, education: 25, location: 25 },
    });
    console.log('data', data);
    useEffect(() => {
        transform((d) => ({ ...d, status: statusRef.current }));
    }, []);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        clearErrors();
        const errs = validateBriefForm(data, t);
        if (Object.keys(errs).length > 0) {
            Object.entries(errs).forEach(([f, m]) => setError(f as keyof BriefFormData, m as string));
            return;
        }
        statusRef.current = 'active';
        post(route('dashboard.briefs.store'));
    }

    function saveDraft() {
        clearErrors();
        const errs = validateBriefForm(data, t);
        if (Object.keys(errs).length > 0) {
            Object.entries(errs).forEach(([f, m]) => setError(f as keyof BriefFormData, m as string));
            return;
        }
        statusRef.current = 'draft';
        post(route('dashboard.briefs.store'));
    }

    // Helpers to convert string↔SelectOption for react-select
    const toOption = (val: string, opts: SelectOption[]) => opts.find((o) => o.value === val) ?? null;
    const toMultiOptions = (val: string, opts: SelectOption[]) =>
        val ? val.split(',').map((v) => opts.find((o) => o.value === v.trim()) ?? { value: v.trim(), label: v.trim() }) : [];

    return (
        <AppLayout>
            <Head title={t('briefs.create_briefs.create.title')} />

            <div className="bg-ds-bg min-h-full px-6 py-8">
                {/* Header */}
                <div className="mb-6 flex items-start gap-3">
                    <Link
                        href={route('dashboard.briefs.index')}
                        className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:bg-ds-accent/[0.06] hover:text-ds-accent mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition"
                        title={t('briefs.create_briefs.actions.back')}
                    >
                        <ChevronLeft size={16} />
                    </Link>
                    <div>
                        <p className="text-ds-text3 mb-1 text-[12px]">
                            <Link href={route('dashboard.briefs.index')} className="hover:text-ds-text2 transition">
                                Sourcing
                            </Link>{' '}
                            <span className="text-ds-text2">› {t('briefs.create_briefs.create.title')}</span>
                        </p>
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('briefs.create_briefs.create.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">{t('briefs.create_briefs.create.subtitle')}</p>
                    </div>
                </div>

                <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* ── LEFT ── */}
                    <div className="space-y-5">
                        {/* Position info */}
                        <FormCard title={t('briefs.create_briefs.create.sections.position')}>
                            <div className="space-y-4">
                                <FormField label={t('briefs.create_briefs.fields.title')} required error={errors.title}>
                                    <input
                                        className={inputCls(errors.title)}
                                        placeholder={t('briefs.create_briefs.fields.title_placeholder')}
                                        value={data.title}
                                        maxLength={100}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                </FormField>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label={t('briefs.create_briefs.fields.sector')} required error={errors.sector}>
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={sectors}
                                            value={toOption(data.sector, sectors)}
                                            onChange={(opt) => setData('sector', opt?.value ?? '')}
                                            placeholder={t('briefs.create_briefs.fields.sector_placeholder')}
                                        />
                                    </FormField>

                                    <FormField label={t('briefs.create_briefs.fields.contract_type')} required error={errors.contract_type}>
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={contract_types}
                                            value={toOption(data.contract_type, contract_types)}
                                            onChange={(opt) => setData('contract_type', opt?.value ?? '')}
                                            placeholder={t('briefs.create_briefs.fields.contract_type_placeholder')}
                                        />
                                    </FormField>

                                    <FormField label={t('briefs.create_briefs.fields.location')} required error={errors.location}>
                                        <input
                                            className={inputCls(errors.location)}
                                            placeholder={t('briefs.create_briefs.fields.location_placeholder')}
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                        />
                                    </FormField>

                                    <FormField label={t('briefs.create_briefs.fields.salary_range')} error={errors.salary_range}>
                                        <input
                                            className={inputCls(errors.salary_range)}
                                            placeholder={t('briefs.create_briefs.fields.salary_range_placeholder')}
                                            value={data.salary_range}
                                            onChange={(e) => setData('salary_range', e.target.value)}
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </FormCard>

                        {/* Candidate criteria */}
                        <FormCard title={t('briefs.create_briefs.create.sections.candidate')}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        label={t('briefs.create_briefs.fields.min_experience_years')}
                                        required
                                        error={errors.min_experience_years}
                                    >
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={experience_options}
                                            value={toOption(data.min_experience_years, experience_options)}
                                            onChange={(opt) => setData('min_experience_years', opt?.value ?? '')}
                                            placeholder={t('briefs.create_briefs.fields.min_experience_years_placeholder')}
                                        />
                                    </FormField>

                                    <FormField label={t('briefs.create_briefs.fields.education_level')} required error={errors.education_level}>
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={education_levels}
                                            value={toOption(data.education_level, education_levels)}
                                            onChange={(opt) => setData('education_level', opt?.value ?? '')}
                                            placeholder={t('briefs.create_briefs.fields.education_level_placeholder')}
                                        />
                                    </FormField>

                                    <FormField label={t('briefs.create_briefs.fields.gender_pref')} error={errors.gender_pref}>
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={gender_prefs}
                                            value={toOption(data.gender_pref, gender_prefs)}
                                            onChange={(opt) => setData('gender_pref', opt?.value ?? '')}
                                            placeholder={t('briefs.create_briefs.fields.gender_pref_placeholder')}
                                            isClearable
                                        />
                                    </FormField>

                                    <FormField label={t('briefs.create_briefs.fields.age_range')} error={errors.age_range}>
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={age_ranges}
                                            value={toOption(data.age_range, age_ranges)}
                                            onChange={(opt) => setData('age_range', opt?.value ?? '')}
                                            placeholder={t('briefs.create_briefs.fields.age_range_placeholder')}
                                            isClearable
                                        />
                                    </FormField>
                                </div>

                                <FormField label={t('briefs.create_briefs.fields.languages')} error={errors.languages}>
                                    <ReactSelect
                                        classNamePrefix="rs"
                                        isMulti
                                        options={languages}
                                        value={toMultiOptions(data.languages, languages)}
                                        onChange={(opts) => setData('languages', opts.map((o) => o.value).join(', '))}
                                        placeholder={t('briefs.create_briefs.fields.languages_placeholder')}
                                    />
                                </FormField>

                                <FormField label="Niveau de séniorité" error={errors.seniority_level}>
                                    <ReactSelect
                                        classNamePrefix="rs"
                                        options={seniority_levels}
                                        value={toOption(data.seniority_level, seniority_levels)}
                                        onChange={(opt) => setData('seniority_level', opt?.value ?? '')}
                                        placeholder="Choisir un niveau…"
                                        isClearable
                                    />
                                </FormField>

                                <FormField label="Entreprises cibles" error={errors.target_companies}>
                                    <input
                                        className={inputCls(errors.target_companies)}
                                        placeholder="ex: Google, Meta, Amazon (séparés par des virgules)"
                                        value={data.target_companies}
                                        onChange={(e) => setData('target_companies', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        </FormCard>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="space-y-5">
                        {/* Description */}
                        <FormCard title={t('briefs.create_briefs.create.sections.description')}>
                            <div className="space-y-4">
                                <FormField
                                    label={t('briefs.create_briefs.fields.mission_description')}
                                    required
                                    error={errors.mission_description}
                                    hint={`${data.mission_description.length}/2000`}
                                >
                                    <textarea
                                        className={textareaCls(errors.mission_description)}
                                        placeholder={t('briefs.create_briefs.fields.mission_description_placeholder')}
                                        value={data.mission_description}
                                        maxLength={2000}
                                        rows={4}
                                        onChange={(e) => setData('mission_description', e.target.value)}
                                    />
                                </FormField>

                                <FormField label={t('briefs.create_briefs.fields.required_skills')} required error={errors.required_skills}>
                                    <textarea
                                        className={textareaCls(errors.required_skills)}
                                        placeholder={t('briefs.create_briefs.fields.required_skills_placeholder')}
                                        value={data.required_skills}
                                        rows={3}
                                        onChange={(e) => setData('required_skills', e.target.value)}
                                    />
                                </FormField>

                                <FormField label={t('briefs.create_briefs.fields.soft_skills')} error={errors.soft_skills}>
                                    <textarea
                                        className={textareaCls(errors.soft_skills)}
                                        placeholder={t('briefs.create_briefs.fields.soft_skills_placeholder')}
                                        value={data.soft_skills}
                                        rows={3}
                                        onChange={(e) => setData('soft_skills', e.target.value)}
                                    />
                                </FormField>

                                <FormField
                                    label="Instruction de sourcing"
                                    error={errors.search_prompt}
                                    hint="Décrivez le profil recherché en langage naturel. Ex : « commercial junior terrain, pas de managers ni de directeurs »"
                                >
                                    <textarea
                                        className={textareaCls(errors.search_prompt)}
                                        placeholder="Ex : je veux un commercial junior, exclure responsable, directeur, manager…"
                                        value={data.search_prompt}
                                        maxLength={1000}
                                        rows={3}
                                        onChange={(e) => setData('search_prompt', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        </FormCard>

                        {/* Scoring weights */}
                        <FormCard title="">
                            <ScoringSlider
                                weights={data.scoring_weights}
                                onChange={(w) => setData('scoring_weights', w)}
                                error={errors['scoring_weights'] as string | undefined}
                            />
                        </FormCard>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={saveDraft}
                                disabled={processing}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex-1 rounded-lg border py-2.5 text-[13px] font-medium transition disabled:opacity-50"
                            >
                                {t('briefs.create_briefs.actions.save_draft')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-ds-accent flex-1 rounded-lg py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? t('briefs.create_briefs.actions.creating') : `${t('briefs.create_briefs.actions.create')} →`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
