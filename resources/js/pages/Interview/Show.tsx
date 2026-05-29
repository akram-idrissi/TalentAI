import { CRITERIA_COLORS, CRITERIA_LABELS, VERDICT_CONFIG } from '@/constants/interviews';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { PeerInterview, ShowInterviewProps } from '@/types/interviews';
import { scoreColor } from '@/utils/interviews';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Bot, CheckCircle2, ChevronRight, Download, MessageSquare, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import TranscriptPanel from './components/TranscriptPanel';

export default function Show({ interview, transcription, peers }: ShowInterviewProps) {
    const { t } = useI18n();
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    const verdict = transcription?.verdict ?? null;
    const verdictCfg = verdict ? (VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG['À approfondir']) : null;
    const globalScore = transcription?.global_score ?? transcription?.analysis_score ?? null;
    const criteria = transcription?.criteria ?? {};
    const strengths = transcription?.strengths ?? [];
    const redFlags = transcription?.red_flags ?? [];
    const keyExcerpts = transcription?.key_excerpts ?? [];
    const diarized = transcription?.diarized_transcript ?? [];

    useEffect(() => {
        if (!transcription || transcription.analysis_status === 'done' || transcription.analysis_status === 'failed') return;
        const timer = setInterval(() => {
            router.reload({ only: ['transcription'] });
        }, 5000);
        return () => clearInterval(timer);
    }, [transcription?.analysis_status]);

    return (
        <>
            <Head title={`${t('interviews.show.title')} — ${interview.candidate_name}`} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-4 py-6 sm:px-6 sm:py-8">
                    {/* Page title */}
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            {/* Back button */}
                            <Link
                                href="/dashboard/interviews"
                                className="bg-ds-surface border-ds-border hover:bg-ds-surface2 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition"
                            >
                                <ArrowLeft size={16} className="text-ds-text2" />
                            </Link>
                            <div>
                                {/* Breadcrumb */}
                                <nav className="mb-1 flex items-center gap-1.5 text-[12px]">
                                    <span className="text-ds-text3">{t('interviews.index.breadcrumb')}</span>
                                    <ChevronRight size={11} className="text-ds-text3" />
                                    <span className="text-ds-text3">{t('interviews.show.breadcrumb')}</span>
                                </nav>
                                <h1 className="font-heading text-ds-text text-2xl font-bold sm:text-3xl">
                                    {t('interviews.show.title')} · {interview.candidate_name}
                                </h1>
                                <p className="text-ds-text3 mt-1.5 text-[13px]">
                                    {interview.brief_title}
                                    {' · '}
                                    {t('interviews.show.interview_date', { date: interview.scheduled_at })}
                                    {interview.duration_minutes ? ` · ${t('interviews.show.duration', { count: interview.duration_minutes })}` : ''}
                                </p>
                            </div>
                        </div>
                        {diarized.length > 0 && (
                            <button
                                onClick={() => setTranscriptOpen(true)}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface2 mt-1 inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition"
                            >
                                <MessageSquare size={13} />
                                Transcription
                            </button>
                        )}
                    </div>

                    {/* Waiting state */}
                    {!transcription || transcription.analysis_status !== 'done' ? (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-20 text-center">
                            <div className="bg-ds-surface2 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                <MessageSquare size={22} className="text-ds-text3" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('interviews.show.waiting_title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('interviews.show.waiting_desc')}</p>
                            <div className="bg-ds-bg3 mt-5 h-1 w-48 overflow-hidden rounded-full">
                                <div className="bg-ds-accent h-full w-3/4 animate-pulse rounded-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Main two-column grid */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                                {/* Left column */}
                                <div className="flex flex-col gap-4">
                                    {/* Score card */}
                                    <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                                        {/* Label */}
                                        <p className="text-ds-text3 mb-3 text-[11px] font-semibold tracking-[0.8px] uppercase">
                                            {t('interviews.show.score_label')}
                                        </p>
                                        {/* Score + badge + summary */}
                                        <div className="flex items-start gap-5">
                                            {/* Score number */}
                                            <div className="shrink-0">
                                                <p className={`font-heading text-[48px] leading-none font-extrabold ${scoreColor(globalScore ?? 0)}`}>
                                                    {globalScore ?? '—'}
                                                </p>
                                                <p className="text-ds-text3 mt-1 text-[12px]">/100</p>
                                            </div>
                                            {/* Badge + summary */}
                                            <div className="flex flex-col gap-2 pt-1">
                                                {verdictCfg && (
                                                    <span
                                                        className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase ${verdictCfg.cls}`}
                                                    >
                                                        ✓ {verdictCfg.label}
                                                    </span>
                                                )}
                                                {transcription.summary && (
                                                    <p className="text-ds-text2 text-[13px] leading-relaxed">{transcription.summary}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Criteria panel */}
                                    <CriteriaPanelInline criteria={criteria} label={t('interviews.show.criteria_title')} />
                                </div>

                                {/* Right column */}
                                <div className="flex flex-col gap-4">
                                    {/* Strengths */}
                                    {strengths.length > 0 && (
                                        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <CheckCircle2 size={13} className="text-emerald-500" />
                                                <p className="text-[11px] font-semibold tracking-[0.8px] text-emerald-600 uppercase dark:text-emerald-400">
                                                    {t('interviews.show.strengths_title')}
                                                </p>
                                            </div>
                                            <ul className="flex flex-col gap-2">
                                                {strengths.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                        <span className="text-ds-text2 text-[13px] leading-relaxed">{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Red flags */}
                                    {redFlags.length > 0 && (
                                        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <AlertTriangle size={13} className="text-amber-500" />
                                                <p className="text-[11px] font-semibold tracking-[0.8px] text-amber-600 uppercase dark:text-amber-400">
                                                    {t('interviews.show.red_flags_title')}
                                                </p>
                                            </div>
                                            <ul className="flex flex-col gap-2">
                                                {redFlags.map((r, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                                                        <span className="text-ds-text2 text-[13px] leading-relaxed">{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Key excerpts */}
                                    {keyExcerpts.length > 0 && <ExcerptsBlock excerpts={keyExcerpts} title={t('interviews.show.excerpts_title')} />}

                                    {/* Action buttons */}
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button className="border-ds-border text-ds-text2 hover:bg-ds-surface2 inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-medium transition">
                                            <Download size={14} />
                                            {t('interviews.show.export_pdf')}
                                        </button>
                                        <button className="bg-ds-accent hover:bg-ds-accent/90 inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition">
                                            {t('interviews.show.make_offer')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Comparative ranking table */}
                            {peers.length > 0 && (
                                <ComparativeRanking peers={peers} currentId={interview.id} recommendation={transcription.recommendation} t={t} />
                            )}

                            {/* Transcript modal */}
                            {transcriptOpen && (
                                <div
                                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
                                    onClick={() => setTranscriptOpen(false)}
                                >
                                    <div
                                        className="bg-ds-bg border-ds-border flex w-full max-w-3xl flex-col rounded-2xl border shadow-2xl"
                                        style={{ maxHeight: '85vh' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Modal header */}
                                        <div className="border-ds-border flex items-center justify-between border-b px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare size={14} className="text-ds-text3" />
                                                <span className="text-ds-text text-[13px] font-semibold">
                                                    Transcription — {interview.candidate_name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setTranscriptOpen(false)}
                                                className="text-ds-text3 hover:text-ds-text rounded-md p-1 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        {/* Modal body */}
                                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                                            <TranscriptPanel segments={diarized} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* Inline sub-components                                                       */
/* -------------------------------------------------------------------------- */

function CriteriaPanelInline({ criteria, label }: { criteria: Record<string, { score: number; comment: string }>; label: string }) {
    return (
        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
            <p className="font-heading text-ds-text mb-5 text-[16px] font-bold">{label}</p>
            <div className="flex flex-col gap-3.5">
                {Object.entries(criteria).map(([key, crit]) => {
                    const colors = CRITERIA_COLORS[key] ?? { bar: 'bg-ds-text3', text: 'text-ds-text2' };
                    return (
                        <div key={key} className="flex items-center gap-3">
                            <span className="text-ds-text2 w-40 shrink-0 text-[13px]">{CRITERIA_LABELS[key] ?? key}</span>
                            <div className="bg-ds-bg3 h-[6px] flex-1 overflow-hidden rounded-full">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                                    style={{ width: `${crit.score}%` }}
                                />
                            </div>
                            <span className={`font-heading w-8 shrink-0 text-right text-[15px] font-bold ${colors.text}`}>{crit.score}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const EXCERPTS_PREVIEW = 2;

const EXCERPT_LIMIT = 150;

function ExcerptItem({ ex }: { ex: { speaker: string; text: string; timestamp: string | null; criterion: string } }) {
    const [open, setOpen] = useState(false);
    const isInt = ex.speaker === 'Interviewer';
    const color = isInt ? 'text-ds-accent' : 'text-emerald-600 dark:text-emerald-400';
    const border = isInt ? 'border-ds-accent' : 'border-emerald-500';
    const truncated = ex.text.length > EXCERPT_LIMIT;
    const preview = truncated ? ex.text.slice(0, EXCERPT_LIMIT) : ex.text;

    return (
        <div className={`bg-ds-bg rounded-r-lg border-l-2 px-4 py-3 ${border}`}>
            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`text-[10px] font-bold tracking-[0.6px] uppercase ${color}`}>
                    {ex.criterion ? (CRITERIA_LABELS[ex.criterion] ?? ex.criterion) : ex.speaker}
                </span>
                {ex.timestamp && <span className="text-ds-text3 text-[10px]">· {ex.timestamp}</span>}
            </div>
            <p className="text-ds-text2 text-[12px] leading-relaxed italic">
                {open || !truncated ? (
                    <>
                        "{ex.text}"{' '}
                        {truncated && (
                            <button onClick={() => setOpen(false)} className={`ml-0.5 text-[11px] font-semibold not-italic ${color}`}>
                                ↑ Réduire
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        "{preview}…"{' '}
                        <button onClick={() => setOpen(true)} className={`ml-0.5 text-[11px] font-semibold not-italic ${color}`}>
                            Lire plus →
                        </button>
                    </>
                )}
            </p>
        </div>
    );
}

function ExcerptsBlock({
    excerpts,
    title,
}: {
    excerpts: { speaker: string; text: string; timestamp: string | null; criterion: string }[];
    title: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? excerpts : excerpts.slice(0, EXCERPTS_PREVIEW);
    const hasMore = excerpts.length > EXCERPTS_PREVIEW;

    return (
        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
            <p className="text-ds-text3 mb-4 text-[11px] font-semibold tracking-[0.8px] uppercase">{title}</p>
            <div className="flex flex-col gap-3">
                {visible.map((ex, i) => (
                    <ExcerptItem key={i} ex={ex} />
                ))}
            </div>
            {hasMore && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="text-ds-accent hover:text-ds-accent/80 mt-3 text-[12px] font-semibold transition"
                >
                    {expanded
                        ? '↑ Réduire'
                        : `↓ Voir ${excerpts.length - EXCERPTS_PREVIEW} extrait${excerpts.length - EXCERPTS_PREVIEW > 1 ? 's' : ''} de plus`}
                </button>
            )}
        </div>
    );
}

function ComparativeRanking({
    peers,
    currentId,
    recommendation,
    t,
}: {
    peers: PeerInterview[];
    currentId: number;
    recommendation: string | null;
    t: (key: string, opts?: Record<string, string | number>) => string;
}) {
    const rankBg = ['bg-amber-500', 'bg-ds-text3', 'bg-amber-700'];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-ds-text3 text-[11px] font-semibold tracking-[1px] uppercase">
                {t('interviews.show.ranking_title', { count: peers.length })}
            </h2>

            <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-ds-border border-b">
                                {[
                                    t('interviews.show.ranking_rank'),
                                    t('interviews.show.ranking_candidate'),
                                    t('interviews.show.ranking_score'),
                                    t('interviews.show.ranking_communication'),
                                    t('interviews.show.ranking_leadership'),
                                    t('interviews.show.ranking_adequation'),
                                    t('interviews.show.ranking_verdict'),
                                ].map((col) => (
                                    <th key={col} className="text-ds-text3 px-4 py-3 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {peers.map((peer, idx) => {
                                const isCurrentCandidate = peer.id === currentId;
                                const peerVerdict = peer.verdict ? (VERDICT_CONFIG[peer.verdict] ?? VERDICT_CONFIG['À approfondir']) : null;
                                const commScore = peer.criteria['communication_clarte']?.score ?? null;
                                const leadScore = peer.criteria['leadership_managerial']?.score ?? null;
                                const cultureScore = peer.criteria['adequation_culturelle']?.score ?? null;

                                return (
                                    <tr
                                        key={peer.id}
                                        className={`border-ds-border border-b last:border-0 ${isCurrentCandidate ? 'bg-ds-accent/5' : ''}`}
                                    >
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-bold text-white ${rankBg[idx] ?? 'bg-ds-text3'}`}
                                            >
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-[13px] font-semibold ${isCurrentCandidate ? 'text-ds-text' : 'text-ds-text2'}`}>
                                                {peer.candidate_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`font-heading text-[13px] font-bold ${scoreColor(peer.global_score ?? 0)}`}>
                                                {peer.global_score ?? '—'}/100
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-ds-text2 text-[13px]">{commScore ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-ds-text2 text-[13px]">{leadScore ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-ds-text2 text-[13px]">{cultureScore ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {peerVerdict && (
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${peerVerdict.cls}`}
                                                >
                                                    {peerVerdict.label}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* AI recommendation */}
                {recommendation && (
                    <div className="border-ds-border border-t px-4 py-4">
                        <div className="flex items-start gap-3">
                            <Bot size={15} className="text-ds-accent mt-0.5 shrink-0" />
                            <div>
                                <p className="text-ds-accent mb-1 text-[11px] font-semibold">{t('interviews.show.ai_recommendation')}</p>
                                <p className="text-ds-text2 text-[13px] leading-relaxed">{recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
