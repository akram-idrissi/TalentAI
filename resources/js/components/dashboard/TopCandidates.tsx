interface Candidate {
    rank: number;
    name: string;
    role: string;
    experience: number;
    score: number;
}

const rankStyles: Record<number, string> = {
    1: 'bg-ds-amber/15 text-ds-amber border border-ds-amber/30',
    2: 'bg-slate-400/12 text-slate-400 border border-slate-400/20',
    3: 'bg-amber-800/12 text-amber-600 border border-amber-700/20',
};

function scoreColor(score: number) {
    if (score >= 90) return 'text-score-high';
    if (score >= 80) return 'text-score-mid';
    return 'text-score-low';
}

export default function TopCandidates({ candidates, onViewAll }: { candidates: Candidate[]; onViewAll?: () => void }) {
    return (
        <div className="border-ds-border bg-dash-card flex h-full flex-col rounded-xl border p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading text-ds-text text-[15px] font-semibold">Top candidats IA cette semaine</h2>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="border-ds-border2 text-ds-text2 hover:bg-ds-surface2 hover:text-ds-text rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
                    >
                        Voir tout
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {candidates.map((c) => (
                    <div
                        key={c.rank}
                        className="border-ds-border bg-ds-bg3/40 hover:border-ds-border2 hover:bg-ds-surface2 flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-150 hover:translate-x-0.5"
                    >
                        <span
                            className={`font-heading flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${rankStyles[c.rank] ?? 'border-ds-border bg-ds-bg3 text-ds-text3 border'}`}
                        >
                            {c.rank}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-heading text-ds-text truncate text-[14px] font-semibold">{c.name}</p>
                            <p className="text-ds-text2 truncate text-[12px]">
                                {c.role} · {c.experience} ans exp.
                            </p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className={`font-heading text-2xl font-bold ${scoreColor(c.score)}`}>{c.score}</p>
                            <p className="text-ds-text3 text-[11px]">/100</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
