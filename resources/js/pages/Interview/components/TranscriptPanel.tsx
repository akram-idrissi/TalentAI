import { DiarizedSegment } from '@/types/interviews';
import { formatTime } from '@/utils/interviews';
import { MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
export default function TranscriptPanel({ segments }: { segments: DiarizedSegment[] }) {
    const [filter, setFilter] = useState<string>('all');

    const speakers = useMemo(() => Array.from(new Set(segments.map((s) => s.speaker))), [segments]);

    const visible = filter === 'all' ? segments : segments.filter((s) => s.speaker === filter);

    const isInterviewer = (speaker: string) => {
        const s = speaker.toLowerCase();
        return s.includes('interviewer') || s === 'speaker 0' || s === 'spk_0';
    };

    return (
        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-ds-text3" />
                    <p className="font-heading text-ds-text3 text-[11px] font-semibold tracking-[0.8px] uppercase">Transcription diarisée</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {(['all', ...speakers] as string[]).map((sp) => (
                        <button
                            key={sp}
                            onClick={() => setFilter(sp)}
                            className={[
                                'rounded-md border px-2.5 py-1 text-[11px] font-semibold transition',
                                filter === sp
                                    ? 'border-ds-accent bg-ds-accent/10 text-ds-accent'
                                    : 'border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text',
                            ].join(' ')}
                        >
                            {sp === 'all' ? 'Tous' : sp}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
                {visible.length === 0 ? (
                    <p className="text-ds-text3 py-8 text-center text-[13px]">Aucun segment disponible.</p>
                ) : (
                    visible.map((seg, i) => {
                        const isInt = isInterviewer(seg.speaker);
                        return (
                            <div key={i} className="flex items-start gap-3">
                                {/* Avatar */}
                                <div
                                    className={[
                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                                        isInt ? 'bg-ds-accent/10 text-ds-accent' : 'bg-emerald-50 text-emerald-700',
                                    ].join(' ')}
                                >
                                    {seg.speaker.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span
                                            className={`text-[10px] font-semibold tracking-[0.5px] uppercase ${
                                                isInt ? 'text-ds-accent' : 'text-emerald-600'
                                            }`}
                                        >
                                            {seg.speaker}
                                        </span>
                                        {seg.start != null && (
                                            <span className="text-ds-text3 text-[10px]">
                                                {formatTime(seg.start)}
                                                {seg.end != null ? ` – ${formatTime(seg.end)}` : ''}
                                            </span>
                                        )}
                                    </div>
                                    {/* Bubble — flat bg for interviewer, bordered for candidate */}
                                    <div
                                        className={[
                                            'rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed',
                                            isInt ? 'bg-ds-surface2 text-ds-text2' : 'border-ds-border bg-ds-surface text-ds-text2 border',
                                        ].join(' ')}
                                    >
                                        {seg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
