import { CRITERIA_LABELS } from '@/constants/interviews';
import { Criterion } from '@/types/interviews';
import { scoreColor } from '@/utils/interviews';
import ScoreBar from './ScoreBar';
export default function CriteriaPanel({ criteria }: { criteria: Record<string, Criterion> }) {
    return (
        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
            <p className="font-heading text-ds-text3 mb-4 text-[11px] font-semibold tracking-[0.8px] uppercase">Évaluation par critère</p>
            <div className="flex flex-col gap-5">
                {Object.entries(criteria).map(([key, crit]) => (
                    <div key={key}>
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-ds-text2 text-[13px]">{CRITERIA_LABELS[key] ?? key}</span>
                            <span className={`font-heading text-[14px] font-bold ${scoreColor(crit.score)}`}>{crit.score}</span>
                        </div>
                        <ScoreBar score={crit.score} />
                        {crit.comment && <p className="text-ds-text3 mt-1.5 text-[11px] leading-relaxed">{crit.comment}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
