import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Props {
    interviews: any[];
}

const Reports = ({ interviews }: Props) => {
    return (
        <AppLayout>
            <Head title="AI Reports - TalentAI" />
            
            <div className="p-6 bg-[#0f172a] min-h-screen">
                {/* Header (Functional Specs 3.4) */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold font-syne text-white">📊 AI Performance Reports</h1>
                    <p className="text-gray-400 text-sm">Review candidate evaluations and AI-generated insights.</p>
                </div>

                <div className="max-w-4xl space-y-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Entretiens analysés récemment</h3>
                    
                    {interviews.length > 0 ? (
                        interviews.map((item) => (
                            <div key={item.id} className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 flex items-center gap-6 group hover:border-purple-500/50 transition-all shadow-xl">
                                
                                {/* Status Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                                    item.verdict ? 'bg-purple-600/20 text-purple-400' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                    {item.verdict ? '▶️' : '⌛'}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-white font-syne">{item.candidate_name}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            item.verdict ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}>
                                            {item.verdict ? '✓ Rapport prêt' : 'En cours'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-3 font-mono uppercase">{item.platform} • {item.date}</p>
                                    
                                    {/* Visual Representation (Functional Specs 3.1 & 3.2) */}
                                    {item.verdict ? (
                                        <div className="flex gap-0.5 h-6 items-center">
                                            {[...Array(24)].map((_, i) => (
                                                <div key={i} className="w-1 bg-purple-500/40 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <div className="bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-slate-800">
                                                <div className="bg-amber-500 h-full animate-pulse" style={{ width: '65%' }}></div>
                                            </div>
                                            <p className="text-[9px] text-amber-500 mt-2 font-mono italic">Transcription en cours · 65%</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-dashed border-slate-700">
                            <p className="text-gray-500">Aucun rapport disponible pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Reports;