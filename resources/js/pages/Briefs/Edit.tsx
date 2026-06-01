import { useBriefForm } from '@/hooks/useBriefForm';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { EditBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Eye } from 'lucide-react';
import { useState } from 'react';
import BriefForm from './components/BriefForm';

export default function EditBrief({ brief, params }: EditBriefProps) {
    const { t } = useI18n();
    const [confirmingCancel, setConfirmingCancel] = useState(false);

    const form = useBriefForm({
        initial: brief,
        onSubmit: (payload) => router.put(route('dashboard.briefs.update', brief.id), payload),
        onSaveDraft: (payload) => router.put(route('dashboard.briefs.update', brief.id), payload),
    });

    const cancelAction = confirmingCancel ? (
        <div className="border-ds-border flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[12px]">
            <span className="text-ds-text3">{t('briefs.edit_brief.actions.cancel_confirm')}</span>
            <Link href={route('dashboard.briefs.show', brief.id)} className="text-ds-red font-semibold hover:underline">
                {t('briefs.edit_brief.actions.cancel_yes')}
            </Link>
            <button type="button" onClick={() => setConfirmingCancel(false)} className="text-ds-text2 hover:underline">
                {t('briefs.edit_brief.actions.cancel_no')}
            </button>
        </div>
    ) : (
        <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            disabled={form.processing}
            className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex-1 rounded-lg border py-2.5 text-[13px] transition disabled:opacity-50"
        >
            {t('briefs.edit_brief.actions.cancel')}
        </button>
    );

    return (
        <AppLayout>
            <Head title={t('briefs.edit_brief.title')} />

            <div className="bg-ds-bg min-h-full px-6 py-8">
                <div className="mb-6 flex items-start gap-3">
                    <Link
                        href={route('dashboard.briefs.index')}
                        className="border-ds-border text-ds-text3 mt-1 flex h-8 w-8 items-center justify-center rounded-lg border"
                    >
                        <ChevronLeft size={16} />
                    </Link>

                    <div className="flex flex-1 items-start justify-between">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('briefs.edit_brief.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('briefs.edit_brief.subtitle')}</p>
                        </div>

                        <Link
                            href={route('dashboard.briefs.show', brief.id)}
                            className="border-ds-border text-ds-text2 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px]"
                        >
                            <Eye size={14} />
                            {t('briefs.edit_brief.actions.show')}
                        </Link>
                    </div>
                </div>

                <BriefForm
                    data={form.data}
                    errors={form.errors}
                    processing={form.processing}
                    params={params}
                    onChange={form.setData}
                    onSubmit={form.handleSubmit}
                    onSaveDraft={form.handleSaveDraft}
                    actions={cancelAction}
                    saveDraftLabel={t('briefs.edit_brief.actions.save_draft')}
                    submitLabel={t('briefs.edit_brief.actions.save')}
                    processingLabel={t('briefs.edit_brief.actions.saving')}
                />
            </div>
        </AppLayout>
    );
}
