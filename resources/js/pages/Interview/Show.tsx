import { VERDICT_CONFIG } from '@/constants/interviews';
import AppLayout from '@/layouts/app-layout';
import { ShowInterviewProps } from '@/types/interviews';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import CriteriaPanel from './components/CriteriaPanel';
import ExcerptsPanel from './components/ExcerptsPanel';
import { HeroCard } from './components/HeroCard';
import KpiRow from './components/KpiRow';
import TagList from './components/TagList';
import TranscriptPanel from './components/TranscriptPanel';

export default function Show({ interview, transcription }: ShowInterviewProps) {
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
            <Head title={`Rapport — ${interview.candidate_name}`} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Back link */}
                    <div className="mb-4">
                        <Link
                            href="/dashboard/interviews"
                            className="text-ds-text3 hover:text-ds-text inline-flex items-center gap-1.5 text-[12px] transition"
                        >
                            <ArrowLeft size={13} />
                            Retour aux entretiens
                        </Link>
                    </div>

                    {/* Hero */}
                    <HeroCard interview={interview} verdictCfg={verdictCfg} />

                    {/* Waiting state */}
                    {!transcription || transcription.analysis_status !== 'done' ? (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-20 text-center">
                            <div className="bg-ds-surface2 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                <MessageSquare size={22} className="text-ds-text3" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">Analyse en cours</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">Le rapport IA sera disponible dans quelques instants.</p>
                            <div className="bg-ds-bg3 mt-5 h-1 w-48 overflow-hidden rounded-full">
                                <div className="bg-ds-accent h-full w-3/4 animate-pulse rounded-full" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* KPI row */}
                            <KpiRow globalScore={globalScore} verdict={verdict} exchangeCount={diarized.length} />

                            {/* Main grid */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                                {/* Left — criteria */}
                                <CriteriaPanel criteria={criteria} />

                                {/* Right — strengths, red flags, excerpts */}
                                <div className="flex flex-col gap-4">
                                    {strengths.length > 0 && (
                                        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <CheckCircle2 size={13} className="text-emerald-500" />
                                                <p className="font-heading text-[11px] font-semibold tracking-[0.8px] text-emerald-600 uppercase">
                                                    Points forts
                                                </p>
                                            </div>
                                            <TagList items={strengths} dotClass="bg-emerald-500" />
                                        </div>
                                    )}

                                    {redFlags.length > 0 && (
                                        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <AlertTriangle size={13} className="text-amber-500" />
                                                <p className="font-heading text-[11px] font-semibold tracking-[0.8px] text-amber-600 uppercase">
                                                    Points de vigilance
                                                </p>
                                            </div>
                                            <TagList items={redFlags} dotClass="bg-amber-400" />
                                        </div>
                                    )}

                                    {keyExcerpts.length > 0 && <ExcerptsPanel excerpts={keyExcerpts} />}
                                </div>
                            </div>

                            {/* Full-width transcript */}
                            {diarized.length > 0 && <TranscriptPanel segments={diarized} />}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
