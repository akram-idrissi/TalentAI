import { useBriefForm } from '@/hooks/useBriefForm';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { CreateBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import BriefForm from './components/BriefForm';

export default function CreateBrief({ params }: CreateBriefProps) {
    const { t } = useI18n();

    const form = useBriefForm({
        onSubmit: (payload) => router.post(route('dashboard.briefs.store'), payload),
        onSaveDraft: (payload) => router.post(route('dashboard.briefs.store'), payload),
    });

    return (
        <AppLayout>
            <Head title={t('briefs.create_briefs.create.title')} />

            <div className="bg-ds-bg min-h-full px-6 py-8">
                <div className="mb-6 flex items-start gap-3">
                    <Link
                        href={route('dashboard.briefs.index')}
                        className="border-ds-border text-ds-text3 mt-1 flex h-8 w-8 items-center justify-center rounded-lg border"
                    >
                        <ChevronLeft size={16} />
                    </Link>

                    <div>
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('briefs.create_briefs.create.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">{t('briefs.create_briefs.create.subtitle')}</p>
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
                    saveDraftLabel={t('briefs.create_briefs.actions.save_draft')}
                    submitLabel={t('briefs.create_briefs.actions.create')}
                    processingLabel={t('briefs.create_briefs.actions.creating')}
                />
            </div>
        </AppLayout>
    );
}
