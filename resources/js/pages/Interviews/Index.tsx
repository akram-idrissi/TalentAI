import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Candidate {
    id: string;
    full_name: string;
}

interface Props {
    candidates: Candidate[];
}

const InterviewIndex = ({ candidates }: Props) => {
    const [selectedCandidate, setSelectedCandidate] = useState<string>('');
    const [platform, setPlatform] = useState<string>('zoom');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleUpload = () => {
        if (!selectedCandidate || !file) {
            alert('Please select a candidate and a recording file.');
            return;
        }

        setIsUploading(true);

        router.post(
            '/dashboard/interviews',
            {
                candidate_id: selectedCandidate,
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
                            {/* Candidate */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium tracking-wider text-white uppercase">Candidate Name</label>

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

                            {/* Platform */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium tracking-wider text-white uppercase">Interview Platform</label>

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

                            {/* Upload */}
                            <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-slate-700 bg-[#0f172a] p-8 text-center transition-all hover:border-purple-500">
                                <div className="mb-2 text-3xl">📥</div>

                                <p className="text-sm font-medium text-gray-300">Click or drag recording here</p>

                                <p className="mt-2 font-mono text-[10px] text-gray-500 italic">MP4, M4A, WAV, MP3 · Max 500 MB</p>

                                <input
                                    type="file"
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    accept="audio/*,video/*"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const selectedFile = e.target.files?.[0] || null;
                                        setFile(selectedFile);
                                    }}
                                />

                                <label className="pointer-events-none mt-4 inline-block rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-xs text-gray-300">
                                    {file ? `Selected: ${file.name}` : 'Browse Local Files'}
                                </label>
                            </div>

                            {/* Button */}
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

                    {/* Processing */}
                    <div className="space-y-4">
                        <h3 className="font-syne mb-2 text-sm font-semibold tracking-wider text-gray-400 text-white uppercase">Current Processing</h3>

                        <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-[#1e293b] p-5">
                            <div className="animate-spin-slow flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-xl text-amber-500">
                                ⚙️
                            </div>

                            <div className="flex-1">
                                <div className="mb-2 flex justify-between">
                                    <span className="text-sm font-bold text-white italic">Transcription (Whisper API)...</span>

                                    <span className="font-mono text-xs text-amber-500">65%</span>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full border border-slate-700 bg-[#0f172a]">
                                    <div
                                        className="h-full rounded-full bg-amber-500 transition-all duration-1000 ease-in-out"
                                        style={{ width: '65%' }}
                                    />
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
