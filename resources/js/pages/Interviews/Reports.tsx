import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

/**
 * Interface defining the structure of an Interview Report
 */
interface InterviewReport {
    id: number;
    candidate_name: string;
    platform: string;
    verdict: string | null;
    status: string;
    date: string;
}

/**
 * Component Props mapping data from InterviewController@reports
 */
interface Props {
    interviews: InterviewReport[];
}

const Reports = ({ interviews }: Props) => {
    // Static waveform heights
    const staticWaveHeights: number[] = [20, 60, 35, 80, 45, 70, 30, 90, 50, 40, 75, 25];

    return (
        <AppLayout>
            <Head title="AI Reports - TalentAI" />

            <div className="min-h-screen bg-[#0f172a] p-8 font-sans text-white">
                {/* Section Header */}
                <div className="mb-8">
                    <h2 className="font-syne mb-6 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Entretiens Analysés Récemment</h2>
                </div>

                {/* Interviews List Container */}
                <div className="max-w-3xl space-y-4">
                    {interviews.length > 0 ? (
                        interviews.map((item) => {
                            // Check status based on verdict or explicit database status
                            const isCompleted = item.verdict !== null || item.status === 'completed';

                            return (
                                <div
                                    key={item.id}
                                    className="group flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#1e293b] p-6 shadow-xl transition-all duration-300 hover:border-slate-700/80"
                                >
                                    {/* Left Side: Icon and Candidate Details */}
                                    <div className="flex flex-1 items-center gap-5">
                                        {/* Play / Progress Circle Icon */}
                                        {isCompleted ? (
                                            <button className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 pl-0.5 text-xs text-white shadow-lg transition-all hover:bg-indigo-500">
                                                ▶
                                            </button>
                                        ) : (
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-lg text-amber-500">
                                                ⏳
                                            </div>
                                        )}

                                        {/* Text Info */}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-syne mb-1 text-base font-bold tracking-wide text-white uppercase">
                                                {item.candidate_name}
                                            </h3>

                                            <p className="space-x-2 font-mono text-xs font-medium text-slate-400">
                                                <span>45 min</span>

                                                <span className="text-slate-600">•</span>

                                                <span className="capitalize">{item.platform}</span>

                                                <span className="text-slate-600">•</span>

                                                <span>{item.date}</span>
                                            </p>

                                            {/* Waveform or Progress Bar */}
                                            {isCompleted ? (
                                                <div className="mt-4 flex h-6 items-end gap-[3px] opacity-50 transition-opacity group-hover:opacity-80">
                                                    {staticWaveHeights.map((h: number, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="w-[3px] rounded-full bg-indigo-400"
                                                            style={{
                                                                height: `${h}%`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-4 max-w-md animate-pulse">
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-slate-800 bg-[#0f172a]">
                                                        <div
                                                            className="h-full rounded-full bg-amber-500"
                                                            style={{
                                                                width: '65%',
                                                            }}
                                                        ></div>
                                                    </div>

                                                    <p className="mt-1.5 font-mono text-[10px] font-bold tracking-wider text-amber-500/90 italic">
                                                        Transcription en cours · 65%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Status Badges */}
                                    <div className="ml-4 flex-shrink-0">
                                        {isCompleted ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 shadow-sm">
                                                ✓ Rapport prêt
                                            </span>
                                        ) : (
                                            <span className="inline-flex animate-pulse items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 shadow-sm">
                                                En cours
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Empty State */
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-[#1e293b]/50 py-20 text-center">
                            <p className="font-syne text-sm text-slate-500">No analysis reports found. Start by uploading an interview.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Reports;
