import { CRITERIA_LABELS } from '@/constants/interviews';
import { KeyExcerpt } from '@/types/interviews';
export default function ExcerptsPanel({ excerpts }: { excerpts: KeyExcerpt[] }) {
    return (
        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
            <p className="font-heading text-ds-text3 mb-4 text-[11px] font-semibold tracking-[0.8px] uppercase">Extraits clés</p>
            <div className="flex flex-col gap-3">
                {excerpts.map((ex, i) => (
                    <div
                        key={i}
                        className={`bg-ds-bg rounded-r-lg border-l-2 px-4 py-3 ${
                            ex.speaker === 'Interviewer' ? 'border-ds-accent' : 'border-emerald-500'
                        }`}
                    >
                        <div className="mb-1.5 flex items-center gap-2">
                            <span
                                className={`text-[10px] font-bold tracking-[0.6px] uppercase ${
                                    ex.speaker === 'Interviewer' ? 'text-ds-accent' : 'text-emerald-600'
                                }`}
                            >
                                {ex.speaker}
                            </span>
                            {ex.timestamp && <span className="text-ds-text3 text-[10px]">· {ex.timestamp}</span>}
                            <span className="text-ds-text3 ml-auto text-[10px]">{CRITERIA_LABELS[ex.criterion] ?? ex.criterion}</span>
                        </div>
                        <p className="text-ds-text2 text-[12px] leading-relaxed italic">"{ex.text}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
