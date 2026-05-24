import { STATUS_BADGE, STATUSES, StatusKey } from '@/constants/interviews';
import { useI18n } from '@/hooks/useI18n';
import { InterviewRecord } from '@/types/interviews';
import { Link } from '@inertiajs/react';
import { Calendar, Mic, MicOff } from 'lucide-react';
export default function InterviewIndexRow({ interview }: { interview: InterviewRecord }) {
    const { t } = useI18n();

    const statusKey = (STATUSES.includes(interview.transcription_status as StatusKey) ? interview.transcription_status : 'none') as StatusKey;

    const isProcessing = ['processing', 'pending'].includes(statusKey);
    const hasReport = statusKey === 'done' && interview.analysis_status === 'done';
    const canView = statusKey === 'done';

    const platformLabel = t(`interviews.list.platforms.${interview.platform}`) ?? interview.platform;

    const { cls, icon: StatusIcon } = STATUS_BADGE[statusKey];
    return (
        <div className="border-ds-border bg-ds-surface hover:border-ds-border2 group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all">
            {/* Icon */}
            <div
                className={[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                    statusKey === 'done' ? 'bg-ds-accent' : statusKey === 'failed' ? 'bg-ds-red/20' : 'bg-ds-surface2',
                ].join(' ')}
            >
                <Mic size={15} className={statusKey === 'failed' ? 'hidden' : 'text-white'} />
                <MicOff size={15} className={statusKey !== 'failed' ? 'hidden' : 'text-ds-red'} />
            </div>

            {/* Main info */}
            <div className="min-w-0 flex-1">
                <p className="font-heading text-ds-text truncate text-[14px] font-semibold">{interview.candidate_name}</p>
                <div className="text-ds-text3 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                    <span className="text-ds-text2 font-medium">{interview.brief_title}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5">
                        <Calendar size={10} />
                        {interview.scheduled_at}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{platformLabel}</span>
                </div>

                {/* Progress bar for in-progress items */}
                {isProcessing && (
                    <div className="mt-2">
                        <div className="bg-ds-bg3 h-1 w-full overflow-hidden rounded-full">
                            <div className="bg-ds-accent h-full w-3/4 animate-pulse rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
                <StatusIcon size={10} />
                {t(`interviews.list.status.${statusKey}`)}
            </span>

            {/* CTA */}
            {canView ? (
                <Link
                    href={`/dashboard/interviews/${interview.id}`}
                    className="border-ds-border text-ds-text2 hover:bg-ds-surface2 hover:text-ds-text shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition"
                >
                    {hasReport ? t('interviews.list.row.report') : t('interviews.list.row.view')}
                </Link>
            ) : (
                /* Placeholder so layout doesn't shift */
                <div className="w-[72px] shrink-0" />
            )}
        </div>
    );
}
