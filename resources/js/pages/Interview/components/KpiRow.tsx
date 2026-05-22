import { scoreColor } from '@/utils/interviews';
export default function KpiRow({
    globalScore,
    verdict,
    exchangeCount,
}: {
    globalScore: number | null;
    verdict: string | null;
    exchangeCount: number;
}) {
    return (
        <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="bg-ds-surface2 rounded-xl p-4">
                <p className="text-ds-text3 mb-1 text-[11px] font-semibold tracking-[0.6px] uppercase">Score global</p>
                <p className={`font-heading text-[32px] leading-none font-bold ${scoreColor(globalScore ?? 0)}`}>
                    {globalScore ?? '—'}
                    <span className="text-ds-text3 ml-1 text-[14px] font-normal">/100</span>
                </p>
            </div>
            <div className="bg-ds-surface2 rounded-xl p-4">
                <p className="text-ds-text3 mb-1 text-[11px] font-semibold tracking-[0.6px] uppercase">Verdict IA</p>
                <p className="font-heading text-ds-text text-[16px] leading-snug font-bold">{verdict ?? '—'}</p>
            </div>
            <div className="bg-ds-surface2 rounded-xl p-4">
                <p className="text-ds-text3 mb-1 text-[11px] font-semibold tracking-[0.6px] uppercase">Échanges</p>
                <p className="font-heading text-ds-text text-[32px] leading-none font-bold">{exchangeCount}</p>
            </div>
        </div>
    );
}
