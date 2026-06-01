import FormCard from '@/components/briefs/FormCard';
import { FormField, inputCls, textareaCls } from '@/components/briefs/FormField';
import ScoringSlider from '@/components/briefs/ScoringSlider';
import { useI18n } from '@/hooks/useI18n';
import type { BriefFormData, SelectOption } from '@/types/brief';
import ReactSelect from 'react-select';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BriefFormParams {
    sectors: SelectOption[];
    education_levels: SelectOption[];
    experience_options: SelectOption[];
    age_ranges: SelectOption[];
    languages: SelectOption[];
    seniority_levels: SelectOption[];
    contract_types: SelectOption[];
    gender_prefs: SelectOption[];
}

export interface BriefFormProps {
    data: BriefFormData;
    errors: Partial<Record<keyof BriefFormData, string>>;
    processing: boolean;
    params: BriefFormParams;
    onChange: <K extends keyof BriefFormData>(field: K, value: BriefFormData[K]) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSaveDraft: () => void;
    actions?: React.ReactNode;
    saveDraftLabel?: string;
    submitLabel?: string;
    processingLabel?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function toOption(val: string, opts: SelectOption[]): SelectOption | null {
    return opts.find((o) => o.value === String(val)) ?? null;
}

function toMultiOptions(val: string, opts: SelectOption[]): SelectOption[] {
    if (!val) return [];
    return val
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => opts.find((o) => o.value === v) ?? { value: v, label: v });
}

// ─── Form sections ────────────────────────────────────────────────────────────

function PositionSection({
    data,
    errors,
    params,
    onChange,
    t,
}: {
    data: BriefFormData;
    errors: BriefFormProps['errors'];
    params: BriefFormParams;
    onChange: BriefFormProps['onChange'];
    t: (key: string) => string;
}) {
    return (
        <FormCard title={t('briefs.form.sections.position')}>
            <div className="space-y-4">
                <FormField label={t('briefs.create_briefs.fields.title')} required error={errors.title}>
                    <input
                        className={inputCls(errors.title)}
                        placeholder={t('briefs.create_briefs.fields.title_placeholder')}
                        value={data.title}
                        maxLength={100}
                        onChange={(e) => onChange('title', e.target.value)}
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                    <FormField label={t('briefs.create_briefs.fields.sector')} required error={errors.sector}>
                        <ReactSelect
                            classNamePrefix="rs"
                            options={params.sectors}
                            value={toOption(data.sector, params.sectors)}
                            onChange={(opt) => onChange('sector', opt?.value ?? '')}
                            placeholder={t('briefs.create_briefs.fields.sector_placeholder')}
                        />
                    </FormField>

                    <FormField label={t('briefs.create_briefs.fields.contract_type')} required error={errors.contract_type}>
                        <ReactSelect
                            classNamePrefix="rs"
                            options={params.contract_types}
                            value={toOption(data.contract_type, params.contract_types)}
                            onChange={(opt) => onChange('contract_type', opt?.value ?? '')}
                            placeholder={t('briefs.create_briefs.fields.contract_type_placeholder')}
                        />
                    </FormField>

                    <FormField label={t('briefs.create_briefs.fields.location')} required error={errors.location}>
                        <input
                            className={inputCls(errors.location)}
                            placeholder={t('briefs.create_briefs.fields.location_placeholder')}
                            value={data.location}
                            onChange={(e) => onChange('location', e.target.value)}
                        />
                    </FormField>

                    <FormField label={t('briefs.create_briefs.fields.salary_range')} error={errors.salary_range}>
                        <input
                            className={inputCls(errors.salary_range)}
                            placeholder={t('briefs.create_briefs.fields.salary_range_placeholder')}
                            value={data.salary_range}
                            onChange={(e) => onChange('salary_range', e.target.value)}
                        />
                    </FormField>
                </div>
            </div>
        </FormCard>
    );
}

function CandidateSection({
    data,
    errors,
    params,
    onChange,
    t,
}: {
    data: BriefFormData;
    errors: BriefFormProps['errors'];
    params: BriefFormParams;
    onChange: BriefFormProps['onChange'];
    t: (key: string) => string;
}) {
    return (
        <FormCard title={t('briefs.form.sections.candidate')}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <FormField label={t('briefs.create_briefs.fields.min_experience_years')} required error={errors.min_experience_years}>
                        <ReactSelect
                            classNamePrefix="rs"
                            options={params.experience_options}
                            value={toOption(String(data.min_experience_years ?? ''), params.experience_options)}
                            onChange={(opt) => onChange('min_experience_years', opt?.value ?? '')}
                            placeholder={t('briefs.create_briefs.fields.min_experience_years_placeholder')}
                        />
                    </FormField>

                    <FormField label={t('briefs.create_briefs.fields.education_level')} required error={errors.education_level}>
                        <ReactSelect
                            classNamePrefix="rs"
                            options={params.education_levels}
                            value={toOption(data.education_level, params.education_levels)}
                            onChange={(opt) => onChange('education_level', opt?.value ?? '')}
                            placeholder={t('briefs.create_briefs.fields.education_level_placeholder')}
                        />
                    </FormField>

                    <FormField label={t('briefs.create_briefs.fields.gender_pref')} error={errors.gender_pref}>
                        <ReactSelect
                            classNamePrefix="rs"
                            options={params.gender_prefs}
                            value={toOption(data.gender_pref, params.gender_prefs)}
                            onChange={(opt) => onChange('gender_pref', opt?.value ?? '')}
                            placeholder={t('briefs.create_briefs.fields.gender_pref_placeholder')}
                            isClearable
                        />
                    </FormField>

                    <FormField label={t('briefs.create_briefs.fields.age_range')} error={errors.age_range}>
                        <ReactSelect
                            classNamePrefix="rs"
                            options={params.age_ranges}
                            value={toOption(data.age_range, params.age_ranges)}
                            onChange={(opt) => onChange('age_range', opt?.value ?? '')}
                            placeholder={t('briefs.create_briefs.fields.age_range_placeholder')}
                            isClearable
                        />
                    </FormField>
                </div>

                <FormField label={t('briefs.create_briefs.fields.languages')} error={errors.languages}>
                    <ReactSelect
                        classNamePrefix="rs"
                        isMulti
                        options={params.languages}
                        value={toMultiOptions(data.languages, params.languages)}
                        onChange={(opts) => onChange('languages', opts.map((o) => o.value).join(', '))}
                        placeholder={t('briefs.create_briefs.fields.languages_placeholder')}
                    />
                </FormField>

                <FormField label={t('briefs.form.fields.seniority_level')} error={errors.seniority_level}>
                    <ReactSelect
                        classNamePrefix="rs"
                        options={params.seniority_levels}
                        value={toOption(data.seniority_level, params.seniority_levels)}
                        onChange={(opt) => onChange('seniority_level', opt?.value ?? '')}
                        placeholder={t('briefs.form.fields.seniority_level_placeholder')}
                        isClearable
                    />
                </FormField>

                <FormField label={t('briefs.form.fields.target_companies')} error={errors.target_companies}>
                    <input
                        className={inputCls(errors.target_companies)}
                        placeholder={t('briefs.form.fields.target_companies_placeholder')}
                        value={data.target_companies}
                        onChange={(e) => onChange('target_companies', e.target.value)}
                    />
                </FormField>
            </div>
        </FormCard>
    );
}

function DescriptionSection({
    data,
    errors,
    onChange,
    t,
}: {
    data: BriefFormData;
    errors: BriefFormProps['errors'];
    onChange: BriefFormProps['onChange'];
    t: (key: string) => string;
}) {
    return (
        <FormCard title={t('briefs.form.sections.description')}>
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
                        onChange={(e) => onChange('mission_description', e.target.value)}
                    />
                </FormField>

                <FormField label={t('briefs.create_briefs.fields.required_skills')} required error={errors.required_skills}>
                    <textarea
                        className={textareaCls(errors.required_skills)}
                        placeholder={t('briefs.create_briefs.fields.required_skills_placeholder')}
                        value={data.required_skills}
                        rows={3}
                        onChange={(e) => onChange('required_skills', e.target.value)}
                    />
                </FormField>

                <FormField label={t('briefs.create_briefs.fields.soft_skills')} error={errors.soft_skills}>
                    <textarea
                        className={textareaCls(errors.soft_skills)}
                        placeholder={t('briefs.create_briefs.fields.soft_skills_placeholder')}
                        value={data.soft_skills}
                        rows={3}
                        onChange={(e) => onChange('soft_skills', e.target.value)}
                    />
                </FormField>
            </div>
        </FormCard>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BriefForm({
    data,
    errors,
    processing,
    params,
    onChange,
    onSubmit,
    onSaveDraft,
    actions,
    saveDraftLabel,
    submitLabel,
    processingLabel,
}: BriefFormProps) {
    const { t } = useI18n();

    return (
        <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* ── LEFT column ── */}
            <div className="space-y-5">
                <PositionSection data={data} errors={errors} params={params} onChange={onChange} t={t} />
                <CandidateSection data={data} errors={errors} params={params} onChange={onChange} t={t} />
            </div>

            {/* ── RIGHT column ── */}
            <div className="space-y-5">
                <DescriptionSection data={data} errors={errors} onChange={onChange} t={t} />

                <FormCard title="">
                    <ScoringSlider
                        weights={data.scoring_weights}
                        onChange={(w) => onChange('scoring_weights', w)}
                        error={errors.scoring_weights as string | undefined}
                    />
                </FormCard>

                {/* Action bar — page-specific buttons injected via the actions slot */}
                <div className="flex gap-3">
                    {actions}

                    <button
                        type="button"
                        onClick={onSaveDraft}
                        disabled={processing}
                        className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex-1 rounded-lg border py-2.5 text-[13px] font-medium transition disabled:opacity-50"
                    >
                        {saveDraftLabel ?? t('briefs.create_briefs.actions.save_draft')}
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-ds-accent flex-1 rounded-lg py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing
                            ? (processingLabel ?? t('briefs.create_briefs.actions.creating'))
                            : `${submitLabel ?? t('briefs.create_briefs.actions.create')} →`}
                    </button>
                </div>
            </div>
        </form>
    );
}
