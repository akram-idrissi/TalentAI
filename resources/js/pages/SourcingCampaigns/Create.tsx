import { FormField, inputCls } from '@/components/briefs/FormField';
import { SourcingCampaignInfoRow } from '@/components/SourcingCampaigns/SourcingCampaignInfoRow';
import { SourcingCampaignSectionHeading } from '@/components/SourcingCampaigns/SourcingCampaignSectionHeading';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { SelectOption } from '@/types/sourcing_campaigns';
import { FormData, Props } from '@/types/sourcing_campaigns';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CalendarDays, ChevronRight, FileText, Globe, Hash, Loader2, Search, Settings2, Sparkles } from 'lucide-react';
import ReactSelect from 'react-select';

export default function Create({ briefs, params }: Props) {
    const { t } = useI18n();
    const { sourcing_social_platforms } = params;

    const { data, setData, processing, errors } = useForm<FormData>({
        target_urls: [],
        max_posts: '20',
        posted_limit_date: '',
        brief_id: '',
    });

    const e = errors as Record<string, string>;

    function submit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        router.post(route('dashboard.sourcing-campaigns.store'), {
            target_urls: data.target_urls.map((o) => o.value),
            max_posts: Number(data.max_posts),
            posted_limit_date: data.posted_limit_date || null,
            brief_id: Number(data.brief_id),
        });
    }

    const briefOptions = briefs.map((b) => ({ value: String(b.id), label: b.title }));
    const selectedBrief = briefOptions.find((o) => o.value === data.brief_id) ?? null;

    const urlCount = data.target_urls.length;
    const urlHint =
        urlCount === 1
            ? t('sourcing_campaigns.create.fields.target_urls.hint_single').replace(':count', String(urlCount))
            : t('sourcing_campaigns.create.fields.target_urls.hint_plural').replace(':count', String(urlCount));

    const canSubmit = !processing && data.target_urls.length > 0 && !!data.brief_id;

    return (
        <AppLayout>
            <Head title={t('sourcing_campaigns.create.header.title')} />

            <div className="bg-ds-bg min-h-full px-6 py-8">
                {/* ── Breadcrumb + Header ── */}
                <div className="mb-8">
                    {/* Breadcrumb */}
                    <nav className="mb-4 flex items-center gap-1.5 text-[12px]">
                        <Link
                            href={route('dashboard.sourcing-campaigns.index')}
                            className="text-ds-text3 hover:text-ds-text2 flex items-center gap-1 transition"
                        >
                            <Search size={11} />
                            {t('sourcing_campaigns.create.header.parent')}
                        </Link>
                        <ChevronRight size={11} className="text-ds-text3/50" />
                        <span className="text-ds-text2 font-medium">{t('sourcing_campaigns.create.header.title')}</span>
                    </nav>

                    <div className="flex items-start gap-3">
                        <Link
                            href={route('dashboard.sourcing-campaigns.index')}
                            className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:bg-ds-accent/[0.06] hover:text-ds-accent mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition"
                            title={t('sourcing_campaigns.create.header.back')}
                        >
                            <ArrowLeft size={15} />
                        </Link>
                        <div>
                            <h1 className="font-heading text-ds-text text-[22px] leading-tight font-bold">
                                {t('sourcing_campaigns.create.header.title')}
                            </h1>
                            <p className="text-ds-text3 mt-1 text-[13px]">{t('sourcing_campaigns.create.header.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={submit} noValidate>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                        {/* ── LEFT — main fields ── */}
                        <div className="space-y-5">
                            {/* Configuration card */}
                            <div className="border-ds-border bg-ds-surface rounded-2xl border p-6">
                                <SourcingCampaignSectionHeading
                                    icon={BookOpen}
                                    title={t('sourcing_campaigns.create.sections.configuration')}
                                    description={
                                        t('sourcing_campaigns.create.sections.configuration_desc') ??
                                        'Choose which job brief and social platforms to target.'
                                    }
                                />

                                <div className="space-y-5">
                                    <FormField label={t('sourcing_campaigns.create.fields.brief.label')} required error={e.brief_id}>
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            options={briefOptions}
                                            value={selectedBrief}
                                            onChange={(opt) => setData('brief_id', opt?.value ?? '')}
                                            placeholder={t('sourcing_campaigns.create.fields.brief.placeholder')}
                                        />
                                    </FormField>

                                    <FormField
                                        label={t('sourcing_campaigns.create.fields.target_urls.label')}
                                        required
                                        error={e.target_urls}
                                        hint={urlHint}
                                    >
                                        <ReactSelect
                                            classNamePrefix="rs"
                                            isMulti
                                            options={sourcing_social_platforms}
                                            value={data.target_urls}
                                            onChange={(opts) => setData('target_urls', opts as SelectOption[])}
                                            placeholder={t('sourcing_campaigns.create.fields.target_urls.placeholder')}
                                            noOptionsMessage={() => t('sourcing_campaigns.create.fields.target_urls.no_options')}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Parameters card */}
                            <div className="border-ds-border bg-ds-surface rounded-2xl border p-6">
                                <SourcingCampaignSectionHeading
                                    icon={Settings2}
                                    title={t('sourcing_campaigns.create.sections.parameters')}
                                    description={
                                        t('sourcing_campaigns.create.sections.parameters_desc') ??
                                        'Fine-tune limits and date filters for this scrape.'
                                    }
                                />

                                <div className="grid grid-cols-2 gap-5">
                                    <FormField
                                        label={t('sourcing_campaigns.create.fields.max_posts.label')}
                                        error={e.max_posts}
                                        hint={t('sourcing_campaigns.create.fields.max_posts.hint')}
                                    >
                                        <div className="relative">
                                            <Hash size={13} className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                                            <input
                                                type="number"
                                                min={0}
                                                value={data.max_posts}
                                                onChange={(ev) => setData('max_posts', ev.target.value)}
                                                className={`${inputCls(e.max_posts)} pl-8`}
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        label={t('sourcing_campaigns.create.fields.posted_limit_date.label')}
                                        error={e.posted_limit_date}
                                        hint={t('sourcing_campaigns.create.fields.posted_limit_date.hint')}
                                    >
                                        <div className="relative">
                                            <CalendarDays
                                                size={13}
                                                className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                            />
                                            <input
                                                type="date"
                                                value={data.posted_limit_date}
                                                onChange={(ev) => setData('posted_limit_date', ev.target.value)}
                                                className={`${inputCls(e.posted_limit_date)} pl-8`}
                                            />
                                        </div>
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT — summary + actions ── */}
                        <div className="space-y-4">
                            {/* Summary card */}
                            <div className="border-ds-border bg-ds-surface rounded-2xl border p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <Sparkles size={14} className="text-ds-accent" />
                                    <p className="font-heading text-ds-text text-[13px] font-semibold">
                                        {t('sourcing_campaigns.create.summary.title') ?? 'Campaign summary'}
                                    </p>
                                </div>

                                <div className="border-ds-border divide-ds-border divide-y rounded-xl border">
                                    <div className="px-3">
                                        <SourcingCampaignInfoRow
                                            icon={FileText}
                                            label={t('sourcing_campaigns.create.fields.brief.label')}
                                            value={selectedBrief?.label ?? '—'}
                                        />
                                    </div>
                                    <div className="px-3">
                                        <SourcingCampaignInfoRow
                                            icon={Globe}
                                            label={t('sourcing_campaigns.create.fields.target_urls.label')}
                                            value={urlCount > 0 ? `${urlCount} platform${urlCount > 1 ? 's' : ''}` : '—'}
                                        />
                                    </div>
                                    <div className="px-3">
                                        <SourcingCampaignInfoRow
                                            icon={Hash}
                                            label={t('sourcing_campaigns.create.fields.max_posts.label')}
                                            value={data.max_posts || '—'}
                                        />
                                    </div>
                                    <div className="px-3">
                                        <SourcingCampaignInfoRow
                                            icon={CalendarDays}
                                            label={t('sourcing_campaigns.create.fields.posted_limit_date.label')}
                                            value={data.posted_limit_date || '—'}
                                        />
                                    </div>
                                </div>

                                {/* Readiness indicator */}
                                <div
                                    className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium transition ${
                                        canSubmit ? 'bg-emerald-50 text-emerald-700' : 'bg-ds-bg3/60 text-ds-text3'
                                    }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${canSubmit ? 'bg-emerald-500' : 'bg-ds-text3/40'}`} />
                                    {canSubmit
                                        ? (t('sourcing_campaigns.create.summary.ready') ?? 'Ready to launch')
                                        : (t('sourcing_campaigns.create.summary.incomplete') ?? 'Fill required fields')}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="bg-ds-accent flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            {t('sourcing_campaigns.create.actions.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Search size={14} />
                                            {t('sourcing_campaigns.create.actions.submit')}
                                        </>
                                    )}
                                </button>

                                <Link
                                    href={route('dashboard.sourcing-campaigns.index')}
                                    className="border-ds-border text-ds-text3 hover:bg-ds-surface hover:text-ds-text2 flex w-full items-center justify-center rounded-xl border py-2.5 text-[13px] font-medium transition"
                                >
                                    {t('sourcing_campaigns.create.actions.cancel')}
                                </Link>
                            </div>

                            {/* Tip */}
                            <p className="text-ds-text3 px-1 text-center text-[11px] leading-relaxed">
                                {t('sourcing_campaigns.create.summary.tip') ?? 'The campaign will start immediately after submission.'}
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
