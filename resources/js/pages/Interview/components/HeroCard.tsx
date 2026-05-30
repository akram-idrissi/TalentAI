import { InterviewData } from '@/types/interviews';
import { getInitials } from '@/utils/interviews';
import { Briefcase, CalendarDays, Download, User, Video } from 'lucide-react';
import MetaPill from './MetaPill';

export function HeroCard({ interview, verdictCfg }: { interview: InterviewData; verdictCfg: { cls: string; label: string } | null }) {
    return (
        <div className="border-ds-border bg-ds-surface mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4">
            <div className="flex items-center gap-4">
                <div className="bg-ds-accent/15 text-ds-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold">
                    {getInitials(interview.candidate_name)}
                </div>

                <div>
                    <h1 className="font-heading text-ds-text text-[20px] leading-tight font-bold">{interview.candidate_name}</h1>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <MetaPill icon={<Briefcase size={13} />} label={interview.brief_title} />

                        <MetaPill icon={<CalendarDays size={13} />} label={interview.scheduled_at} />

                        <MetaPill icon={<Video size={13} />} label={interview.platform} />

                        <MetaPill icon={<User size={13} />} label={interview.interviewer} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {verdictCfg && (
                    <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[12px] font-semibold ${verdictCfg.cls}`}>
                        {verdictCfg.label}
                    </span>
                )}

                <button className="border-ds-border text-ds-text2 hover:bg-ds-surface2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition">
                    <Download size={13} />
                    Exporter PDF
                </button>
            </div>
        </div>
    );
}
