import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

/**
 * Interface for Candidate data (Required for Step 3.2 & 4.2 of functional specs)
 */
interface Candidate {
    id: string; // UUID v4 format
    full_name: string;
}

/**
 * Interface for component props passed from Laravel Controller
 */
interface Props {
    candidates: Candidate[];
}

/**
 * Interview Management Page - Module 4: Intelligence Entretiens
 */
const InterviewIndex = ({ candidates }: Props) => {
    // 1. Local states for the import form
    const [selectedCandidate, setSelectedCandidate] = useState<string>('');
    const [platform, setPlatform] = useState<string>('zoom'); 
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    /**
     * Handle the recording upload using Inertia router.
     * Required for Module 4.2 Transcription Pipeline.
     */
    const handleUpload = () => {
        // Validation before sending to Laravel
        if (!selectedCandidate || !file) {
            alert("Please select a candidate and a recording file.");
            return;
        }

        setIsUploading(true);

        /**
         * Sending multipart/form-data to InterviewController@store.
         * 'forceFormData: true' is mandatory for sending binary files (MP4/MP3).
         */
        router.post('/dashboard/interviews', {
            candidate_id: selectedCandidate,
            platform: platform,
            file: file,
        }, {
            forceFormData: true, 
            onSuccess: () => {
                setIsUploading(false);
                alert("Interview uploaded successfully! AI Analysis starting...");
            },
            onError: (errors) => {
                setIsUploading(false);
                console.error("Upload errors:", errors);
                alert("Upload failed. Please check the required fields.");
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Interviews Management" />
            
            <div className="p-6 bg-[#0f172a] min-h-screen text-white animate-fadeIn">
                
                {/* Page Header consistent with TalentAI Dashboard */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold font-syne text-white">🎙️ Interview Intelligence</h1>
                    <p className="text-gray-400 text-sm">Upload recordings to generate Whisper transcriptions and AI reports.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    {/* LEFT COLUMN: UPLOAD FORM */}
                    <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-xl">
                        <h3 className="text-lg font-semibold mb-6 text-purple-400 font-syne">Import Interview Recording</h3>
                        
                        <div className="space-y-6">
                            {/* Candidate Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider text-white">Candidate Name</label>
                                <select 
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition-all"
                                    value={selectedCandidate}
                                    onChange={(e) => setSelectedCandidate(e.target.value)}
                                >
                                    <option value="">Select a profile...</option>
                                    {candidates?.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Meeting Tool Selection - MCD Compliant */}
                            <div className="flex flex-col gap-2 text-white">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Platform</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['zoom', 'meet', 'teams', 'presentiel'].map(p => (
                                        <button 
                                            key={p}
                                            type="button"
                                            onClick={() => setPlatform(p)}
                                            className={`py-2 px-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                                                platform === p 
                                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                                                : 'bg-[#0f172a] border-slate-700 text-gray-400 hover:border-slate-500'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload Zone - Supports up to 500MB */}
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-[#0f172a] hover:border-purple-500 transition-all cursor-pointer group relative">
                                <div className="text-3xl mb-2">📥</div>
                                <p className="text-sm text-gray-300 font-medium">Click or drag recording here</p>
                                <p className="text-[10px] text-gray-500 mt-2 italic text-white font-mono">MP4, M4A, WAV, MP3 · Max 500 MB</p>
                                
                             <input 
    type="file" 
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
    id="file-upload" 
    accept="audio/*,video/*"
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        // Force the conversion to avoid TypeScript errors
        const files = e.target.files as any;
        if (files && files.length > 0) {
            setFile(files);
        }
    }} 
/>
<label className="mt-4 inline-block px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-gray-300 pointer-events-none">
    {/* Use (file as any).name to bypass the undefined error display */}
    {file ? `Selected: ${(file as any).name}` : "Browse Local Files"}
</label>
                            </div>

                            <button 
                                onClick={handleUpload}
                                disabled={isUploading}
                                className={`w-full py-4 rounded-lg font-bold text-sm shadow-lg transition-transform active:scale-95 ${
                                    isUploading ? 'bg-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }`}
                            >
                                {isUploading ? "Uploading..." : "Lancer l'analyse IA →"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PROGRESS TRACKING */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2 font-syne text-white">Current Processing</h3>
                        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center animate-spin-slow text-xl text-white">⚙️</div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-2 text-white">
                                    <span className="text-sm font-bold italic">Transcription (Whisper API)...</span>
                                    <span className="text-xs font-mono text-amber-500">65%</span>
                                </div>
                                <div className="w-full bg-[#0f172a] rounded-full h-2 overflow-hidden border border-slate-700">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-in-out" style={{ width: '65%' }}></div>
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