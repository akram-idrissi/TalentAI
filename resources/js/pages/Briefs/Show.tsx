import { useI18n } from '@/hooks/useI18n';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { ShowBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ShowBrief({ brief }: ShowBriefProps) {
    const { t } = useI18n();
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const cardClass = 'bg-white dark:bg-[#111118] p-5 rounded-xl border border-gray-200 dark:border-white/10';
    const labelClass = 'text-xs text-gray-500 dark:text-gray-400 mb-1';
    const valueClass = 'text-sm font-medium text-gray-900 dark:text-white';
    const formattedDate = new Date(brief.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    function handleDelete() {
        router.delete(route('dashboard.briefs.destroy', brief.id));
        setConfirmingDelete(false);
    }
    const val = (v?: string) => (v?.trim() ? v : <span className="text-gray-400">—</span>);
    return (
        <>
            <Head title={brief.title} />
            <AppSidebarLayout>
                <div className="min-h-screen bg-gray-50 p-8 text-gray-900 dark:bg-[#0A0A0F] dark:text-white">
                    {/* HEADER */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500">{t('briefs.show_brief.breadcrumb')}</p>
                            <h1 className="text-secondary text-2xl font-bold">{brief.title}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('briefs.show_brief.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('dashboard.briefs.edit', brief.id)}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                {t('briefs.show_brief.actions.edit')}
                            </Link>

                            <button
                                onClick={() => router.post(route('dashboard.briefs.activate', brief.id))}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {t('briefs.show_brief.actions.activate')}
                            </button>

                            {confirmingDelete ? (
                                <div className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm dark:border-red-500/30">
                                    <span className="text-red-500">{t('briefs.show_brief.actions.delete_confirming')}</span>
                                    <button onClick={handleDelete} className="font-semibold text-red-600 hover:underline">
                                        {t('briefs.show_brief.actions.delete_yes')}
                                    </button>
                                    <span className="text-gray-400">·</span>
                                    <button onClick={() => setConfirmingDelete(false)} className="text-gray-500 hover:underline">
                                        {t('briefs.show_brief.actions.delete_no')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmingDelete(true)}
                                    className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V4h6v3m-8 0l1 12h8l1-12" />
                                    </svg>
                                    {t('briefs.show_brief.actions.delete')}
                                </button>
                            )}
                            <Link
                                href={route('dashboard.briefs.index')}
                                className="bg-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
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
                                {t('briefs.show_brief.actions.back')}
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* LEFT */}
                        <div className="space-y-4">
                            {/* Position info */}
                            <div className={cardClass}>
                                <h2 className="mb-4 font-semibold">{t('briefs.show_brief.sections.position')}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.title')}</p>
                                        <p className={valueClass}>{brief.title}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.sector')}</p>
                                        <p className={valueClass}>{brief.sector}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.contract_type')}</p>
                                        <p className={valueClass}>{brief.contract_type}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.location')}</p>
                                        <p className={valueClass}>{brief.location}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.salary_range')}</p>
                                        <p className={valueClass}>{val(brief.salary_range)}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.status')}</p>
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                brief.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                            }`}
                                        >
                                            {t(`briefs.show_brief.statuses.${brief.status}`)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Candidate criteria */}
                            <div className={cardClass}>
                                <h2 className="mb-4 font-semibold">{t('briefs.show_brief.sections.candidate')}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.min_experience_years')}</p>
                                        <p className={valueClass}>
                                            {brief.min_experience_years} {t('briefs.show_brief.fields.years')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.education_level')}</p>
                                        <p className={valueClass}>{brief.education_level}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.languages')}</p>
                                        <p className={valueClass}>{val(brief.languages)}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.age_range')}</p>
                                        <p className={valueClass}>{val(brief.age_range)}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>{t('briefs.show_brief.fields.gender_pref')}</p>
                                        <p className={valueClass}>{val(brief.gender_pref)}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className={labelClass}>{t('briefs.show_brief.fields.required_skills')}</p>
                                    <p className={valueClass}>{val(brief.required_skills)}</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-4">
                            {/* Description */}
                            <div className={cardClass}>
                                <h2 className="mb-3 font-semibold">{t('briefs.show_brief.sections.description')}</h2>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{val(brief.mission_description)}</p>
                                <div className="mt-4">
                                    <p className={labelClass}>{t('briefs.show_brief.fields.soft_skills')}</p>
                                    <p className={valueClass}>{val(brief.soft_skills)}</p>
                                </div>
                            </div>

                            {/* Scoring */}
                            <div className={cardClass}>
                                <h2 className="mb-3 font-semibold">{t('briefs.show_brief.sections.scoring')}</h2>
                                {brief.scoring_weights ? (
                                    Object.entries(brief.scoring_weights).map(([key, value]) => (
                                        <div key={key} className="mb-3">
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="text-gray-500">{t(`briefs.show_brief.scoring.${key}`)}</span>
                                                <span className="font-medium">{value}%</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10">
                                                <div className="h-1.5 rounded-full bg-[#6C63FF]" style={{ width: `${value}%` }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">—</p>
                                )}
                            </div>

                            {/* Meta */}
                            <div className={cardClass}>
                                <h2 className="mb-3 font-semibold">{t('briefs.show_brief.sections.meta')}</h2>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-gray-500">{t('briefs.show_brief.fields.created_by')} </span>
                                        {brief.created_by || '—'}
                                    </p>
                                    <p>
                                        <span className="text-gray-500">{t('briefs.show_brief.fields.created_at')} </span>
                                        {formattedDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppSidebarLayout>
        </>
    );
}
