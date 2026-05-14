import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

/**
 * Interface defining the structure of an Interview Report
 * Required to bypass ESLint 'no-explicit-any' rules.
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
    return (
        <AppLayout>
            <Head title="AI Reports - TalentAI" />

            <div className="min-h-screen bg-[#0f172a] p-6 text-white">
                {/* Module 4 Header - Comparative AI Ranking Analytics */}
                <div className="mb-8">
                    <h1 className="font-syne text-2xl font-bold tracking-tight uppercase">📊 AI Performance Reports</h1>
                    <p className="text-sm font-medium text-gray-400">
                        Review candidate evaluations and AI-generated insights across different platforms.
                    </p>
                </div>

                <div className="max-w-4xl space-y-4">
                    <h3 className="mb-6 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Recently Analyzed Interviews</h3>

                    {interviews.length > 0 ? (
                        interviews.map((item) => (
                            <div
                                key={item.id}
                                className="group flex items-center gap-6 rounded-2xl border border-slate-700/50 bg-[#1e293b] p-5 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40"
                            >
                                {/* Status Indicator Icon */}
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-inner ${
                                        item.verdict
                                            ? 'border border-purple-500/20 bg-purple-600/20 text-purple-400'
                                            : 'border border-amber-500/20 bg-amber-500/10 text-amber-500'
                                    }`}
                                >
                                    {item.verdict ? '▶️' : '⌛'}
                                </div>

                                <div className="flex-1">
                                    <div className="mb-1 flex items-start justify-between">
                                        <h4 className="font-syne text-sm font-bold tracking-wide text-slate-100 uppercase">{item.candidate_name}</h4>
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-[9px] font-black tracking-widest uppercase ${
                                                item.verdict
                                                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                                    : 'animate-pulse border-amber-500/20 bg-amber-500/10 text-amber-500'
                                            }`}
                                        >
                                            {item.verdict ? '✓ Analysis Ready' : 'Processing AI'}
                                        </span>
                                    </div>
                                    <p className="mb-4 font-mono text-[10px] font-bold text-slate-500">
                                        {item.platform} • {item.date}
                                    </p>

                                    {/* Visual Audio Waveform Representation (Module 3.1 & 3.2 Visuals) */}
                                    {item.verdict ? (
                                        <div className="flex h-8 items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                                            {[...Array(32)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 rounded-full bg-gradient-to-t from-purple-600 to-indigo-400"
                                                    style={{ height: `${Math.floor(Math.random() * 80) + 20}%` }}
                                                ></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <div className="h-1.5 overflow-hidden rounded-full border border-slate-800 bg-[#0f172a] shadow-inner">
                                                <div
                                                    className="animate-progress-loading h-full bg-gradient-to-r from-amber-600 to-amber-400"
                                                    style={{ width: '65%' }}
                                                ></div>
                                            </div>
                                            <p className="mt-2 font-mono text-[9px] font-bold tracking-tight text-amber-500/80 italic">
                                                Whisper Transcription in progress · 65%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State consistent with Dashboard UI */
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
