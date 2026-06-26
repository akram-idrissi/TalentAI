import { SourcingCampaignPagination } from '@/components/SourcingCampaigns/SourcingCampaignPagination';
import { SourcingCampaignStatCard } from '@/components/SourcingCampaigns/SourcingCampaignStatCard';
import { SourcingCampaignStatusBadge } from '@/components/SourcingCampaigns/SourcingCampaignStatusBadge';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { IndexProps } from '@/types/sourcing_campaigns';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Clock, Eye, Globe, Layers, Plus, Search, Users, Zap } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('fr');

export default function Index({ sourcingCampaigns }: IndexProps) {
    const { t } = useI18n();
    const runs = sourcingCampaigns.data ?? [];

    // Aggregate stats across all campaigns in this page
    const totalPosts = runs.reduce((sum, r) => sum + r.posts_count, 0);
    const totalCandidates = runs.reduce((sum, r) => sum + r.candidats_count, 0);
    const totalUrls = runs.reduce((sum, r) => sum + r.target_urls.length, 0);

    const columns = [
        t('sourcing_campaigns.index.columns.brief'),
        t('sourcing_campaigns.index.columns.targets'),
        t('sourcing_campaigns.index.columns.posts'),
        t('sourcing_campaigns.index.columns.candidates'),
        t('sourcing_campaigns.index.columns.status'),
        t('sourcing_campaigns.index.columns.started'),
        '',
    ];

    return (
        <>
            <Head title={t('sourcing_campaigns.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-screen px-6 py-6">
                    {/* ── Header ── */}
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="bg-ds-accent/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                    <Search size={15} className="text-ds-accent" />
                                </span>
                                <h1 className="font-heading text-ds-text text-[22px] leading-none font-bold">
                                    {t('sourcing_campaigns.index.title')}
                                </h1>
                            </div>
                            <p className="text-ds-text3 ml-10 text-[13px]">{t('sourcing_campaigns.index.subtitle')}</p>
                        </div>

                        <Link
                            href={route('dashboard.sourcing-campaigns.create')}
                            className="bg-ds-accent flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                        >
                            <Plus size={14} />
                            {t('sourcing_campaigns.index.toolbar.new')}
                        </Link>
                    </div>

                    {/* ── Stat cards (only when there's data) ── */}
                    {runs.length > 0 && (
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <SourcingCampaignStatCard
                                icon={Layers}
                                label={t('sourcing_campaigns.index.columns.campaigns') ?? 'Campaigns'}
                                value={sourcingCampaigns.total}
                            />
                            <SourcingCampaignStatCard
                                icon={Globe}
                                label={t('sourcing_campaigns.index.columns.targets') ?? 'Targets'}
                                value={totalUrls}
                            />
                            <SourcingCampaignStatCard
                                icon={Zap}
                                label={t('sourcing_campaigns.index.columns.posts') ?? 'Posts'}
                                value={totalPosts}
                                accent="bg-blue-50"
                            />
                            <SourcingCampaignStatCard
                                icon={Users}
                                label={t('sourcing_campaigns.index.columns.candidates') ?? 'Candidates'}
                                value={totalCandidates}
                                accent="bg-emerald-50"
                            />
                        </div>
                    )}

                    {/* ── Empty state ── */}
                    {runs.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-2xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Search size={22} className="text-ds-accent" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('sourcing_campaigns.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('sourcing_campaigns.index.empty.description')}</p>
                            <Link
                                href={route('dashboard.sourcing-campaigns.create')}
                                className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                            >
                                <Plus size={14} />
                                {t('sourcing_campaigns.index.empty.cta')}
                            </Link>
                        </div>
                    )}

                    {/* ── Table ── */}
                    {runs.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-2xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border bg-ds-bg3/30 border-b">
                                            {columns.map((col, i) => (
                                                <th
                                                    key={i}
                                                    className="text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runs.map((run) => {
                                            const urlCount = run.target_urls.length;
                                            const urlLabel =
                                                urlCount === 1
                                                    ? t('sourcing_campaigns.index.table.url_single')
                                                    : t('sourcing_campaigns.index.table.url_plural');

                                            return (
                                                <tr
                                                    key={run.id}
                                                    className="border-ds-border hover:bg-ds-bg3/30 group border-b transition-colors last:border-0"
                                                >
                                                    {/* Brief */}
                                                    <td className="max-w-[220px] px-4 py-3.5">
                                                        <p className="font-heading text-ds-text truncate font-semibold">
                                                            {run.brief?.title ?? (
                                                                <span className="text-ds-text3 font-normal italic">
                                                                    {t('sourcing_campaigns.index.table.no_brief')}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* Targets */}
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-ds-text2 inline-flex items-center gap-1.5">
                                                            <Globe size={12} className="text-ds-text3 shrink-0" />
                                                            {urlCount} <span className="text-ds-text3">{urlLabel}</span>
                                                        </span>
                                                    </td>

                                                    {/* Posts */}
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-ds-text2 inline-flex items-center gap-1.5">
                                                            <Zap size={12} className="text-ds-text3 shrink-0" />
                                                            {run.posts_count}
                                                        </span>
                                                    </td>

                                                    {/* Candidates */}
                                                    <td className="px-4 py-3.5">
                                                        {run.candidats_count > 0 ? (
                                                            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                                                                <Users size={12} className="shrink-0" />
                                                                {run.candidats_count}
                                                            </span>
                                                        ) : (
                                                            <span className="text-ds-text3 inline-flex items-center gap-1.5">
                                                                <Users size={12} className="shrink-0" />
                                                                {t('sourcing_campaigns.index.table.no_candidates')}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3.5">
                                                        <SourcingCampaignStatusBadge status={run.status} />
                                                    </td>

                                                    {/* Date */}
                                                    <td className="text-ds-text3 px-4 py-3.5 text-[12px]">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Clock size={11} className="shrink-0" />
                                                            {dayjs(run.created_at).fromNow()}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={route('dashboard.sourcing-campaigns.show', run.id)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent hover:bg-ds-accent/5 flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('sourcing_campaigns.index.table.view')}
                                                            >
                                                                <Eye size={13} />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination ── */}
                            <div className="border-ds-border border-t px-4 py-3">
                                <SourcingCampaignPagination meta={sourcingCampaigns} />
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
