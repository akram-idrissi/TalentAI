import { STATUS_ROW_CONFIG } from '@/constants/interviews';
import { InterviewRecord } from '@/types/interviews';
import { Link } from '@inertiajs/react';
import { Mic } from 'lucide-react';
export function InterviewRow({ interview }: { interview: InterviewRecord }) {
    const cfg = STATUS_ROW_CONFIG[interview.transcription_status as keyof typeof STATUS_ROW_CONFIG] ?? STATUS_ROW_CONFIG.none;

    const isProcessing = ['processing', 'pending'].includes(interview.transcription_status);
    const hasReport = interview.transcription_status === 'done' && interview.analysis_status === 'done';
    const canView = interview.transcription_status === 'done';
    return (
        <div className="border-ds-border bg-ds-surface hover:bg-ds-surface/80 hover:border-ds-border2 flex items-center gap-4 rounded-xl border px-4 py-3 transition-all">
            {/* Icon */}
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${interview.transcription_status === 'done' ? 'bg-ds-accent' : 'bg-ds-surface2'}`}
            >
                <Mic size={16} className="text-white" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="font-heading text-ds-text truncate text-[14px] font-semibold">{interview.candidate_name}</p>
                <p className="text-ds-text2 text-[12px]">
                    {interview.duration_minutes ? `${interview.duration_minutes} min · ` : ''}
                    {interview.platform} · {interview.scheduled_at}
                </p>
                {isProcessing && (
                    <div className="mt-1.5">
                        <div className="bg-ds-bg3 h-1 w-full overflow-hidden rounded-full">
                            <div className="bg-ds-accent h-full w-4/5 animate-pulse rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            {/* Badge */}
            <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}>
                {cfg.label}
            </span>
            {canView && (
                <Link
                    href={`/dashboard/interviews/${interview.id}`}
                    className="border-ds-border text-ds-text2 hover:bg-ds-surface2 hover:text-ds-text shrink-0 rounded-lg border px-3 py-1.5 text-[12px] transition"
                >
                    {hasReport ? 'Rapport →' : 'Voir →'}
                </Link>
            )}
        </div>
    );
}
