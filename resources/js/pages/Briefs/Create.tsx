import { useBriefForm } from '@/hooks/useBriefForm';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { CreateBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Clock, RotateCcw, X } from 'lucide-react';
import BriefForm from './components/BriefForm';

export default function CreateBrief({ params }: CreateBriefProps) {
    const { t } = useI18n();

    const form = useBriefForm({
        autosaveKey: 'new',
        onSubmit: (payload) => router.post(route('dashboard.briefs.store'), payload),
        onSaveDraft: (payload) => router.post(route('dashboard.briefs.store'), payload),
    });

    return (
        <AppLayout>
            <Head title={t('briefs.create_briefs.create.title')} />

            <div className="bg-ds-bg min-h-full px-4 py-6 sm:px-6 sm:py-8">
                {/* ── Autosave restore banner ── */}
                {form.hasRestorableData && (
                    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
                        <div className="flex items-center gap-2">
                            <RotateCcw size={14} className="shrink-0" />
                            <span>{t('briefs.autosave.restore_prompt') || 'You have an unsaved draft from a previous session.'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={form.restore} className="font-semibold underline underline-offset-2 hover:no-underline">
                                {t('briefs.autosave.restore') || 'Restore draft'}
                            </button>
                            <button type="button" onClick={form.dismissRestore} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Page header ── */}
                <div className="mb-6 flex items-start gap-3">
                    <Link
                        href={route('dashboard.briefs.index')}
                        className="border-ds-border text-ds-text3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    >
                        <ChevronLeft size={16} />
                    </Link>

                    <div className="flex-1">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('briefs.create_briefs.create.title')}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="text-ds-text2 text-[14px]">{t('briefs.create_briefs.create.subtitle')}</p>

                            {/* Autosave last-saved indicator */}
                            {form.lastSavedAt && (
                                <span className="text-ds-text3 flex items-center gap-1 text-[12px]">
                                    <Clock size={11} />
                                    {t('briefs.autosave.last_saved') || 'Draft saved'}{' '}
                                    {new Intl.DateTimeFormat(undefined, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }).format(new Date(form.lastSavedAt))}
                                </span>
                            )}

                            {/* Unsaved changes dot */}
                            {form.isDirty && !form.lastSavedAt && (
                                <span className="text-ds-text3 flex items-center gap-1.5 text-[12px]">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    {t('briefs.autosave.unsaved') || 'Unsaved changes'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <BriefForm
                    data={form.data}
                    errors={form.errors}
                    processing={form.processing}
                    params={params}
                    onChange={form.setData}
                    onBlur={form.onBlur}
                    onSubmit={form.handleSubmit}
                    onSaveDraft={form.handleSaveDraft}
                    saveDraftLabel={t('briefs.create_briefs.actions.save_draft')}
                    submitLabel={t('briefs.create_briefs.actions.create')}
                    processingLabel={t('briefs.create_briefs.actions.creating')}
                />
            </div>
        </AppLayout>
    );
}
