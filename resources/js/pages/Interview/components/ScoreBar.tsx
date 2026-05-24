import { scoreBarColor } from '@/utils/interviews';
export default function ScoreBar({ score }: { score: number }) {
    return (
        <div className="bg-ds-bg3 h-1.5 w-full overflow-hidden rounded-full">
            <div className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(score)}`} style={{ width: `${score}%` }} />
        </div>
    );
}
