import { ShowSourcingCampaignStatCard } from '@/components/SourcingCampaigns/ShowSourcingCampaignStatCard';
import { ShowSourcingCampaignStatusBadge } from '@/components/SourcingCampaigns/ShowSourcingCampaignStatusBadge';
import { useI18n } from '@/hooks/useI18n';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Candidat, EnrichmentStats, Post, ShowProps } from '@/types/sourcing_campaigns';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FileText,
    Link2,
    Loader2,
    MessageSquare,
    Sparkles,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

function initials(name: string | null): string {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

function EnrichmentBar({ stats, t }: { stats: EnrichmentStats; t: (k: string, p?: Record<string, string | number>) => string }) {
    if (stats.total === 0) return null;

    const pct = Math.round((stats.enriched / stats.total) * 100);

    return (
        <div className="bg-ds-surface border-ds-border rounded-xl border p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#6C63FF]" />
                    <p className="text-ds-text text-xs font-semibold">{t('sourcing_campaigns.show.cards.enrichment.label')}</p>
                </div>
                <span className="text-ds-text3 text-xs font-medium">
                    {stats.enriched} / {stats.total}
                    {stats.done ? (
                        <span className="ml-2 font-semibold text-emerald-600 dark:text-emerald-400">
                            {t('sourcing_campaigns.show.cards.enrichment.complete')}
                        </span>
                    ) : (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">{t('sourcing_campaigns.show.cards.enrichment.running')}</span>
                    )}
                </span>
            </div>
            <div className="bg-ds-bg3 h-1.5 w-full overflow-hidden rounded-full">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9f97ff] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-ds-text3 mt-2 text-right text-xs font-medium">{pct}%</p>
        </div>
    );
}

function CandidatBadge({ candidat, viewLabel }: { candidat: Candidat | null; viewLabel: string }) {
    if (!candidat) return <span className="text-ds-text3">—</span>;

    const label = candidat.current_title ?? candidat.full_name ?? viewLabel;

    return (
        <Link
            href={`/candidats/${candidat.id}`}
            className="inline-flex max-w-[160px] items-center gap-1 truncate rounded-full bg-[#6C63FF]/10 px-2.5 py-0.5 text-xs font-medium text-[#6C63FF] transition hover:bg-[#6C63FF]/20 dark:bg-[#6C63FF]/15 dark:text-[#a78bfa]"
            title={label}
        >
            <span className="truncate">{label}</span>
            <ExternalLink size={10} className="shrink-0" />
        </Link>
    );
}

function PostCard({ post, t }: { post: Post; t: (k: string) => string }) {
    const [open, setOpen] = useState(false);
    const ini = initials(post.author_name);

    return (
        <div className="bg-ds-surface border-ds-border hover:border-ds-border2 overflow-hidden rounded-xl border transition">
            {/* Post header */}
            <div className="flex items-start gap-4 p-5">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6C63FF]/10 text-xs font-bold text-[#6C63FF] select-none">
                    {ini}
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <a
                            href={post.author_linkedin_url ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ds-text text-sm font-semibold hover:underline"
                        >
                            {post.author_name ?? t('sourcing_campaigns.show.post_card.unknown_author')}
                        </a>
                        {post.author_info && <span className="text-ds-text3 text-xs">{post.author_info}</span>}
                    </div>

                    <p className="text-ds-text2 mt-2 line-clamp-3 text-sm leading-relaxed">{post.content}</p>

                    {post.linkedin_url && (
                        <a
                            href={post.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#6C63FF] hover:underline dark:text-[#a78bfa]"
                        >
                            <ExternalLink size={11} />
                            {t('sourcing_campaigns.show.posts_section.view_post')}
                        </a>
                    )}
                </div>

                {/* Expand toggle */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="border-ds-border bg-ds-bg text-ds-text2 hover:border-ds-border2 hover:text-ds-text flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                >
                    <MessageSquare size={12} />
                    {post.comments.length}
                    {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
            </div>

            {/* Comments table */}
            {open && (
                <div className="border-ds-border bg-ds-bg border-t">
                    {post.comments.length === 0 ? (
                        <p className="text-ds-text3 px-5 py-4 text-sm">{t('sourcing_campaigns.show.posts_section.no_comments')}</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-ds-border bg-ds-bg2 border-b">
                                <tr>
                                    <th className="text-ds-text3 px-5 py-2.5 text-left text-xs font-semibold tracking-wide uppercase">
                                        {t('sourcing_campaigns.show.comments_table.commenter')}
                                    </th>
                                    <th className="text-ds-text3 px-5 py-2.5 text-left text-xs font-semibold tracking-wide uppercase">
                                        {t('sourcing_campaigns.show.comments_table.comment')}
                                    </th>
                                    <th className="text-ds-text3 px-5 py-2.5 text-left text-xs font-semibold tracking-wide uppercase">
                                        {t('sourcing_campaigns.show.comments_table.candidate')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-ds-border divide-y">
                                {post.comments.map((comment) => (
                                    <tr key={comment.id} className="hover:bg-ds-bg2 transition">
                                        <td className="px-5 py-3 align-top">
                                            <div className="flex items-start gap-2">
                                                <div className="bg-ds-bg3 text-ds-text3 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold select-none">
                                                    {initials(comment.commenter_name)}
                                                </div>
                                                <div>
                                                    <a
                                                        href={comment.commenter_linkedin_url ?? '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-ds-text text-sm font-medium hover:underline"
                                                    >
                                                        {comment.commenter_name ?? '—'}
                                                    </a>
                                                    {comment.commenter_position && (
                                                        <p className="text-ds-text3 mt-0.5 text-xs">{comment.commenter_position}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-ds-text2 px-5 py-3 align-top text-sm leading-relaxed">{comment.commentary}</td>
                                        <td className="px-5 py-3 align-top">
                                            <CandidatBadge candidat={comment.candidat} viewLabel={t('sourcing_campaigns.show.candidat_badge.view')} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Show({ sourcingCampaign, enrichment }: ShowProps) {
    const { t } = useI18n();

    const scrapeInProgress = sourcingCampaign.status === 'pending' || sourcingCampaign.status === 'running';

    const enrichmentInProgress = sourcingCampaign.status === 'completed' && !enrichment.done && enrichment.total > 0;

    const shouldPoll = scrapeInProgress || enrichmentInProgress;

    useEffect(() => {
        if (!shouldPoll) return;
        const interval = setInterval(() => {
            router.reload({ only: ['sourcingCampaign', 'enrichment'] });
        }, 5000);
        return () => clearInterval(interval);
    }, [shouldPoll]);

    const statusLabel = t(`sourcing_campaigns.show.status.${sourcingCampaign.status}`) || sourcingCampaign.status;

    const postsUnit =
        sourcingCampaign.posts.length === 1
            ? t('sourcing_campaigns.show.cards.posts.unit_single')
            : t('sourcing_campaigns.show.cards.posts.unit_plural');

    return (
        <>
            <Head title={`${t('sourcing_campaigns.show.title').replace(':id', String(sourcingCampaign.id))}`} />
            <AppSidebarLayout>
                <div className="bg-ds-bg text-ds-text min-h-screen p-4 sm:p-8">
                    {/* ── HEADER ── */}
                    <div className="mb-8 flex items-start gap-3">
                        <Link
                            href={route('dashboard.sourcing-campaigns.index')}
                            className="border-ds-border bg-ds-surface text-ds-text2 hover:border-ds-border2 hover:text-ds-text mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
                            title={t('sourcing_campaigns.show.breadcrumb.back')}
                        >
                            <ArrowLeft size={16} />
                        </Link>

                        <div className="min-w-0 flex-1">
                            <Link
                                href={route('dashboard.sourcing-campaigns.index')}
                                className="text-ds-text3 hover:text-ds-accent text-xs transition"
                            >
                                {t('sourcing_campaigns.show.breadcrumb.all')}
                            </Link>
                            <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                                {t('sourcing_campaigns.show.title').replace(':id', String(sourcingCampaign.id))}
                            </h1>
                            <p className="text-ds-text3 text-sm">{t('sourcing_campaigns.show.subtitle')}</p>
                        </div>

                        <div className="mt-1 shrink-0">
                            <ShowSourcingCampaignStatusBadge status={sourcingCampaign.status} label={statusLabel} />
                        </div>
                    </div>

                    {/* ── IN-PROGRESS BANNER ── */}
                    {(scrapeInProgress || enrichmentInProgress) && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                            <Loader2 size={15} className="shrink-0 animate-spin" />
                            {scrapeInProgress
                                ? t('sourcing_campaigns.show.cards.status.scrape_in_progress')
                                : t('sourcing_campaigns.show.cards.status.enrich_in_progress')}
                        </div>
                    )}

                    {/* ── STAT CARDS ROW ── */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <ShowSourcingCampaignStatCard
                            icon={Link2}
                            label={t('sourcing_campaigns.show.cards.target_urls.title')}
                            value={sourcingCampaign.target_urls.length}
                            sub={sourcingCampaign.target_urls.length === 1 ? 'URL' : 'URLs'}
                        />
                        <ShowSourcingCampaignStatCard
                            icon={FileText}
                            label={t('sourcing_campaigns.show.cards.posts.title')}
                            value={sourcingCampaign.posts.length}
                            sub={postsUnit}
                        />
                        <ShowSourcingCampaignStatCard
                            icon={Users}
                            label={t('sourcing_campaigns.show.cards.enrichment.label')}
                            value={enrichment.total > 0 ? `${enrichment.enriched}/${enrichment.total}` : '—'}
                            sub={
                                enrichment.done
                                    ? t('sourcing_campaigns.show.cards.enrichment.complete')
                                    : enrichment.total > 0
                                      ? t('sourcing_campaigns.show.cards.enrichment.running')
                                      : undefined
                            }
                        />
                    </div>

                    {/* ── TWO COLUMN DETAIL ── */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* LEFT — Target URLs */}
                        <div className="bg-ds-surface border-ds-border rounded-xl border p-5">
                            <h2 className="text-ds-text mb-4 flex items-center gap-2 font-semibold">
                                <Link2 size={15} className="text-ds-text3" />
                                {t('sourcing_campaigns.show.cards.target_urls.title')}
                            </h2>
                            <ul className="space-y-2">
                                {sourcingCampaign.target_urls.map((url) => (
                                    <li key={url} className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C63FF]" />
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-ds-text2 hover:text-ds-accent text-sm break-all transition hover:underline"
                                        >
                                            {url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* RIGHT — Status + Enrichment */}
                        <div className="space-y-4">
                            {/* Status card */}
                            <div className="bg-ds-surface border-ds-border rounded-xl border p-5">
                                <h2 className="text-ds-text mb-4 flex items-center gap-2 font-semibold">
                                    <CheckCircle2 size={15} className="text-ds-text3" />
                                    {t('sourcing_campaigns.show.cards.status.title')}
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-ds-text3 mb-1.5 text-xs">{t('sourcing_campaigns.show.cards.status.label')}</p>
                                        <ShowSourcingCampaignStatusBadge status={sourcingCampaign.status} label={statusLabel} />
                                    </div>
                                    {sourcingCampaign.status === 'failed' && sourcingCampaign.error_message && (
                                        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                            <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                            {sourcingCampaign.error_message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enrichment progress bar */}
                            {sourcingCampaign.status === 'completed' && enrichment.total > 0 && <EnrichmentBar stats={enrichment} t={t} />}
                        </div>
                    </div>

                    {/* ── POSTS SECTION ── */}
                    <div className="mt-8">
                        {sourcingCampaign.posts.length === 0 ? (
                            <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
                                <FileText size={32} className="text-ds-text3 mb-3 opacity-50" />
                                <p className="text-ds-text2 text-sm font-medium">
                                    {scrapeInProgress
                                        ? t('sourcing_campaigns.show.posts_section.empty_pending')
                                        : t('sourcing_campaigns.show.posts_section.empty_done')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-ds-text text-lg font-semibold">{t('sourcing_campaigns.show.posts_section.title')}</h2>
                                    <span className="bg-ds-bg3 text-ds-text3 rounded-full px-2 py-0.5 text-xs font-semibold">
                                        {sourcingCampaign.posts.length}
                                    </span>
                                </div>
                                {sourcingCampaign.posts.map((post) => (
                                    <PostCard key={post.id} post={post} t={t} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppSidebarLayout>
        </>
    );
}
