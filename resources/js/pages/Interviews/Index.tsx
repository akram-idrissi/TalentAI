import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Candidate {
    id: string;
    full_name: string;
}

// 1. Added Brief interface to handle technical requirements
interface Brief {
    id: string;
    title: string;
}

interface Props {
    candidates: Candidate[];
    briefs: Brief[]; // 2. Added briefs prop expected from backend
}

const InterviewIndex = ({ candidates, briefs }: Props) => {
    const [selectedCandidate, setSelectedCandidate] = useState<string>('');
    const [selectedBrief, setSelectedBrief] = useState<string>(''); // 3. State for selected brief
    const [platform, setPlatform] = useState<string>('zoom');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleUpload = () => {
        // 4. Checking if both candidate, brief, and file are filled
        if (!selectedCandidate || !selectedBrief || !file) {
            alert('Please select a candidate, a job brief, and a recording file.');
            return;
        }

        setIsUploading(true);

        router.post(
            '/dashboard/interviews',
            {
                candidate_id: selectedCandidate,
                brief_id: selectedBrief, // 5. Added brief_id to the request payload
                platform: platform,
                file: file,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setIsUploading(false);
                    alert('Interview uploaded successfully! AI Analysis starting...');
                },
                onError: (errors) => {
                    setIsUploading(false);
                    console.error('Upload errors:', errors);
                    alert('Upload failed. Please check the required fields.');
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Interviews Management" />

            <div className="animate-fadeIn min-h-screen bg-[#0f172a] p-6 text-white">
                <div className="mb-8">
                    <h1 className="font-syne text-2xl font-bold text-white">🎙️ Interview Intelligence</h1>
                    <p className="text-sm text-gray-400">Upload recordings to generate Whisper transcriptions and AI reports.</p>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
                        <h3 className="font-syne mb-6 text-lg font-semibold text-purple-400">Import Interview Recording</h3>

                        <div className="space-y-6">
                            {/* Candidate Select Dropdown */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium tracking-wider text-gray-500 text-white uppercase">Candidate Name</label>
                                <select
                                    className="w-full rounded-lg border border-slate-700 bg-[#0f172a] p-3 text-white transition-all outline-none focus:border-purple-500"
                                    value={selectedCandidate}
                                    onChange={(e) => setSelectedCandidate(e.target.value)}
                                >
                                    <option value="">Select a profile...</option>
                                    {candidates?.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 6. NEW FIELD: Job Brief Select Dropdown */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium tracking-wider text-gray-500 text-white uppercase">Associated Job Brief</label>
                                <select
                                    className="w-full rounded-lg border border-slate-700 bg-[#0f172a] p-3 text-white transition-all outline-none focus:border-purple-500"
                                    value={selectedBrief}
                                    onChange={(e) => setSelectedBrief(e.target.value)}
                                >
                                    <option value="">Select a brief...</option>
                                    {briefs?.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 text-white">
                                <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Interview Platform</label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {['zoom', 'meet', 'teams', 'presentiel'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPlatform(p)}
                                            className={`rounded-lg border px-1 py-2 text-[10px] font-bold uppercase transition-all ${
                                                platform === p
                                                    ? 'border-purple-500 bg-purple-600 text-white shadow-lg'
                                                    : 'border-slate-700 bg-[#0f172a] text-gray-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-slate-700 bg-[#0f172a] p-8 text-center transition-all hover:border-purple-500">
                                <div className="mb-2 text-3xl">📥</div>
                                <p className="text-sm font-medium text-gray-300">Click or drag recording here</p>
                                <p className="mt-2 font-mono text-[10px] text-gray-500 text-white italic">MP4, M4A, WAV, MP3 · Max 500 MB</p>

                                <input
                                    type="file"
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    id="file-upload"
                                    accept="audio/*,video/*"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const fileList = e.target.files;

                                        if (fileList && fileList.length > 0) {
                                            setFile(fileList[0]);
                                        } else {
                                            setFile(null);
                                        }
                                    }}
                                />
                                <label className="pointer-events-none mt-4 inline-block rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-xs text-gray-300">
                                    {file ? `Selected: ${file.name}` : 'Browse Local Files'}
                                </label>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className={`w-full rounded-lg py-4 text-sm font-bold shadow-lg transition-transform active:scale-95 ${
                                    isUploading ? 'cursor-not-allowed bg-slate-600' : 'bg-purple-600 text-white hover:bg-purple-500'
                                }`}
                            >
                                {isUploading ? 'Uploading...' : "Lancer l'analyse IA →"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-syne mb-2 text-sm font-semibold tracking-wider text-gray-400 text-white uppercase">Current Processing</h3>
                        <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-[#1e293b] p-5">
                            <div className="animate-spin-slow flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-xl text-amber-500 text-white">
                                ⚙️
                            </div>
                            <div className="flex-1">
                                {/* RIGHT COLUMN: CURRENT PROCESSING & LIVE MONITORING */}
                                <div className="space-y-6">
                                    <h3 className="font-syne text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Current Processing</h3>

                                    <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-[#1e293b] p-6 shadow-xl transition-all duration-300 hover:border-slate-700/80">
                                        {/* Top Header Row within the processing card */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin-slow flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-base text-amber-500">
                                                    ⏳
                                                </div>
                                                <div>
                                                    <h4 className="font-syne text-sm font-bold tracking-wide text-white">
                                                        Transcription (Whisper API)...
                                                    </h4>
                                                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                                                        Processing Amine Alami · Zoom interview
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-mono text-xs font-bold text-amber-500">
                                                65%
                                            </span>
                                        </div>

                                        {/* Progress Bar Container */}
                                        <div className="h-2 w-full overflow-hidden rounded-full border border-slate-800/80 bg-[#0f172a] p-[1px]">
                                            <div
                                                className="h-full animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                                                style={{ width: '65%' }}
                                            ></div>
                                        </div>

                                        {/* Live Status Indicators Footer */}
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-800/40 pt-3 font-mono text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500"></span>
                                                Extracting audio waveform...
                                            </span>
                                            <span>Est. time remaining: ~2 min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default InterviewIndex;
