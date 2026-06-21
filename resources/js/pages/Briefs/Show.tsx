import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { SelectOption, ShowBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const SCORING_COLORS = ['bg-[#6C63FF]', 'bg-[#34D399]', 'bg-[#F59E0B]', 'bg-[#38BDF8]', 'bg-[#F87171]'];

function formatSalary(raw?: string): string {
    if (!raw?.trim()) return '—';
    return raw.replace(/\d+/g, (n) => Number(n).toLocaleString('fr-FR'));
}

function BadgeList({ value }: { value?: string }) {
    if (!value?.trim()) return <span className="text-gray-400">—</span>;
    const items = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return (
        <div className="mt-1 flex flex-wrap gap-1.5">
            {items.map((item) => (
                <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-[#6C63FF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#6C63FF] dark:bg-[#6C63FF]/15 dark:text-[#a78bfa]"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

export default function ShowBrief({ brief, params }: ShowBriefProps) {
    const { t } = useI18n();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);
    function optionLabel(options: SelectOption[] | undefined, value?: string | number | null) {
        if (value === null || value === undefined || value === '') return '—';

        const stringValue = String(value);

        return options?.find((option) => String(option.value) === stringValue)?.label ?? stringValue;
    }
    const labels = {
        sector: optionLabel(params.sectors, brief.sector),
        contractType: optionLabel(params.contract_types, brief.contract_type),
        experience: optionLabel(params.experience_options, brief.min_experience_years),
        education: optionLabel(params.education_levels, brief.education_level),
        ageRange: optionLabel(params.age_ranges, brief.age_range),
        seniority: optionLabel(params.seniority_levels, brief.seniority_level),
        gender: optionLabel(params.gender_prefs, brief.gender_pref),
    };

    const cardClass = 'bg-ds-surface rounded-xl border border-ds-border p-5';
    const labelClass = 'text-xs text-ds-text3 mb-1';
    const valueClass = 'text-sm font-medium text-ds-text';

    const formattedDate = new Date(brief.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    function handleDelete() {
        router.delete(route('dashboard.briefs.destroy', brief.id));
        setShowDeleteModal(false);
    }

    return (
        <>
            <Head title={brief.title} />
            <AppSidebarLayout>
                <div className="bg-ds-bg text-ds-text min-h-screen p-4 sm:p-8">
                    {/* HEADER */}
                    <div className="mb-6 flex items-start gap-3">
                        {/* Back button — left, icon only */}
                        <Link
                            href={route('dashboard.briefs.index')}
                            className="border-ds-border bg-ds-surface text-ds-text2 hover:border-ds-border2 hover:text-ds-text mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
                            title={t('briefs.show_brief.actions.back')}
                        >
                            <ArrowLeft size={16} />
                        </Link>

                        {/* Title block */}
                        <div className="min-w-0 flex-1">
                            <Link href={route('dashboard.briefs.index')} className="text-ds-text3 hover:text-ds-accent text-xs transition">
                                {t('briefs.show_brief.breadcrumb')}
                            </Link>
                            <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">{brief.title}</h1>
                            <p className="text-ds-text3 text-sm">{t('briefs.show_brief.subtitle')}</p>
                        </div>

                        {/* Action buttons — right, icons only */}
                        <div className="mt-1 flex shrink-0 items-center gap-2">
                            <Link
                                href={route('dashboard.briefs.edit', brief.id)}
                                className="border-ds-border bg-ds-surface text-ds-text2 hover:border-ds-border2 hover:text-ds-text flex h-9 w-9 items-center justify-center rounded-lg border transition"
                                title={t('briefs.show_brief.actions.edit')}
                            >
                                <Pencil size={15} />
                            </Link>

                            <button
                                onClick={() => router.post(route('dashboard.briefs.activate', brief.id))}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700"
                                title={t('briefs.show_brief.actions.activate')}
                            >
                                <CheckCircle size={15} />
                            </button>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                                title={t('briefs.show_brief.actions.delete')}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* LEFT */}
                        <div className="space-y-4">
                            {/* Position info */}
                            <div className={cardClass}>
                                <h2 className="text-ds-text mb-4 font-semibold">{t('briefs.show_brief.sections.position')}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.mission_code')}</p>
                                        <p className={valueClass}>{brief.mission_code}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.product_reference')}</p>
                                        <p className={valueClass}>{brief.product_reference}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.title')}</p>
                                        <p className={valueClass}>{brief.title}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.sector')}</p>
                                        <p className={valueClass}>{labels.sector}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.contract_type')}</p>
                                        <p className={valueClass}>{labels.contractType}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.location')}</p>
                                        <p className={valueClass}>{brief.location}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.salary_range')}</p>
                                        <p className={valueClass}>{formatSalary(brief.salary_range)}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.status')}</p>
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                brief.status === 'active'
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            }`}
                                        >
                                            {t(`briefs.show_brief.statuses.${brief.status}`)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Candidate criteria */}
                            <div className={cardClass}>
                                <h2 className="text-ds-text mb-4 font-semibold">{t('briefs.show_brief.sections.candidate')}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.min_experience_years')}</p>
                                        <p className={valueClass}>
                                            {brief.min_experience_years} {t('briefs.show_brief.fields.years')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.education_level')}</p>

                                        <p className={valueClass}>{labels.education}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.age_range')}</p>
                                        <p className={valueClass}>{labels.ageRange}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.gender_pref')}</p>
                                        <p className={valueClass}>{labels.gender}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className={labelClass}>{t('briefs.show_brief.fields.languages')}</p>
                                    <BadgeList value={brief.languages} />
                                </div>
                                <div className="mt-4">
                                    <p className={labelClass}>{t('briefs.show_brief.fields.required_skills')}</p>
                                    <BadgeList value={brief.required_skills} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-4">
                            {/* Description */}
                            <div className={cardClass}>
                                <h2 className="text-ds-text mb-3 font-semibold">{t('briefs.show_brief.sections.description')}</h2>
                                <div>
                                    <p className={`text-ds-text2 text-sm ${!descExpanded ? 'line-clamp-4' : ''}`}>
                                        {brief.mission_description?.trim() || '—'}
                                    </p>
                                    {brief.mission_description && brief.mission_description.length > 200 && (
                                        <button
                                            onClick={() => setDescExpanded((e) => !e)}
                                            className="text-ds-accent mt-1 text-xs font-medium hover:underline"
                                        >
                                            {descExpanded ? 'Réduire' : 'Lire la suite'}
                                        </button>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <p className={labelClass}>{t('briefs.show_brief.fields.soft_skills')}</p>
                                    <BadgeList value={brief.soft_skills} />
                                </div>
                            </div>

                            {/* Scoring */}
                            <div className={cardClass}>
                                <h2 className="text-ds-text mb-3 font-semibold">{t('briefs.show_brief.sections.scoring')}</h2>
                                {brief.scoring_weights ? (
                                    Object.entries(brief.scoring_weights).map(([key, value], idx) => (
                                        <div key={key} className="mb-3">
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="text-ds-text3">{t(`briefs.show_brief.scoring.${key}`)}</span>
                                                <span className="text-ds-text font-medium">{value}%</span>
                                            </div>
                                            <div className="bg-ds-bg3 h-1.5 w-full rounded-full">
                                                <div
                                                    className={`h-1.5 rounded-full ${SCORING_COLORS[idx % SCORING_COLORS.length]}`}
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-ds-text3 text-sm">—</p>
                                )}
                            </div>

                            {/* System info */}
                            <div className={cardClass}>
                                <h2 className="text-ds-text mb-3 font-semibold">{t('briefs.show_brief.sections.meta')}</h2>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-ds-text3">{t('briefs.show_brief.fields.created_by')} </span>
                                        <span className="text-ds-text font-medium">{brief.created_by || '—'}</span>
                                    </p>
                                    <p>
                                        <span className="text-ds-text3">{t('briefs.show_brief.fields.created_at')} </span>
                                        <span className="text-ds-text font-medium">{formattedDate}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete confirmation modal */}
                {showDeleteModal && (
                    <DeleteModal
                        label={brief.title}
                        i18nPrefix="briefs.index.modal"
                        onConfirm={handleDelete}
                        onCancel={() => setShowDeleteModal(false)}
                    />
                )}
            </AppSidebarLayout>
        </>
    );
}
