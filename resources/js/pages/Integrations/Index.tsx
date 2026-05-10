import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';

import { Bot, Briefcase, Calendar, CheckCircle2, Facebook, KeyRound, Link2, Mic, Save, Search, Settings } from 'lucide-react';

interface IntegrationCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    status: 'connected' | 'not_configured';
    info: string;
    progress: number;
    progressColor: string;
    usage: string;
    disabled?: boolean;
}

function IntegrationCard({ icon, title, subtitle, status, info, progress, progressColor, usage, disabled = false }: IntegrationCardProps) {
    const [showConfig, setShowConfig] = useState(false);

    const [apiKey, setApiKey] = useState('');
    const [apiUrl, setApiUrl] = useState('');

    return (
        <div
            className={`border-ds-border bg-ds-surface hover:border-ds-border2 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 ${
                disabled ? 'opacity-60' : ''
            }`}
        >
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
                <div className="text-ds-text flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">{icon}</div>

                <div className="flex-1">
                    <h3 className="font-heading text-ds-text text-[15px] font-semibold">{title}</h3>

                    <p className="text-ds-text2 text-[12px]">{subtitle}</p>
                </div>

                {status === 'connected' ? (
                    <span className="border-ds-green/20 bg-ds-green/10 text-ds-green inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold">
                        <CheckCircle2 size={12} />
                        Connecté
                    </span>
                ) : (
                    <span className="border-ds-border text-ds-text2 inline-flex items-center rounded-full border bg-white/[0.04] px-3 py-1 text-[11px] font-semibold">
                        Non configuré
                    </span>
                )}
            </div>

            {/* Content */}
            <div>
                <p className="text-ds-text3 mb-3 text-[12px]">{info}</p>

                <div className="bg-ds-bg3 h-[6px] overflow-hidden rounded-full">
                    <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progress}%` }} />
                </div>

                <p className="text-ds-text3 mt-2 text-[11px]">{usage}</p>

                {/* CONFIGURATION FORM */}
                {status === 'not_configured' && (
                    <>
                        {!showConfig ? (
                            <button
                                onClick={() => setShowConfig(true)}
                                className="border-ds-border text-ds-text2 hover:border-ds-border2 hover:bg-ds-surface2 hover:text-ds-text mt-5 flex w-full items-center justify-center gap-2 rounded-xl border bg-transparent px-4 py-2.5 text-[13px] font-medium transition"
                            >
                                <Settings size={15} />
                                Configurer
                            </button>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {/* API KEY */}
                                <div>
                                    <label className="text-ds-text2 mb-1.5 flex items-center gap-2 text-[12px] font-medium">
                                        <KeyRound size={14} />
                                        API KEY
                                    </label>

                                    <input
                                        type="text"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Entrer votre API KEY..."
                                        className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent w-full rounded-xl border px-4 py-3 text-[13px] transition outline-none"
                                    />
                                </div>

                                {/* API URL */}
                                <div>
                                    <label className="text-ds-text2 mb-1.5 flex items-center gap-2 text-[12px] font-medium">
                                        <Link2 size={14} />
                                        API URL
                                    </label>

                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        placeholder="https://api.example.com"
                                        className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent w-full rounded-xl border px-4 py-3 text-[13px] transition outline-none"
                                    />
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-2 pt-2">
                                    <button className="bg-ds-accent flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]">
                                        <Save size={15} />
                                        Sauvegarder
                                    </button>

                                    <button
                                        onClick={() => setShowConfig(false)}
                                        className="border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text rounded-xl border px-4 py-3 text-[13px] transition"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function IntegrationsSection() {
    return (
        <AppLayout>
            <div className="bg-ds-bg min-h-full px-6 py-8">
                {/* Header */}
                <div className="mb-7">
                    <h1 className="font-heading text-ds-text text-[28px] font-bold tracking-[-0.5px]">Intégrations & API</h1>

                    <p className="text-ds-text2 mt-1 text-[14px]">Connectez vos outils de sourcing et de visioconférence</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {/* LinkedIn */}
                    <IntegrationCard
                        icon={<Briefcase size={28} />}
                        title="LinkedIn Recruiter API"
                        subtitle="Sourcing automatique de profils"
                        status="connected"
                        info="Token API · Expire le 1er jan 2027"
                        progress={72}
                        progressColor="bg-ds-accent"
                        usage="7 200 / 10 000 crédits utilisés ce mois"
                    />

                    {/* Indeed */}
                    <IntegrationCard
                        icon={<Search size={28} />}
                        title="Indeed Publisher API"
                        subtitle="Import de CVs Indeed"
                        status="connected"
                        info="Token API · Actif"
                        progress={30}
                        progressColor="bg-ds-green"
                        usage="300 / 1 000 imports utilisés"
                    />

                    {/* Whisper */}
                    <IntegrationCard
                        icon={<Mic size={28} />}
                        title="Whisper API (OpenAI)"
                        subtitle="Transcription des entretiens audio"
                        status="connected"
                        info="Clé API active · ~$0.006/min"
                        progress={18}
                        progressColor="bg-ds-amber"
                        usage="3h42 / 20h transcrites ce mois"
                    />

                    {/* Claude */}
                    <IntegrationCard
                        icon={<Bot size={28} />}
                        title="Claude API (Anthropic)"
                        subtitle="Analyse IA centrale"
                        status="connected"
                        info="Claude Sonnet 4 · ~$3/M tokens"
                        progress={42}
                        progressColor="bg-ds-accent2"
                        usage="4.2M / 10M tokens utilisés"
                    />

                    {/* Facebook */}
                    <IntegrationCard
                        icon={<Facebook size={28} />}
                        title="Facebook Jobs API"
                        subtitle="Sourcing réseau social"
                        status="not_configured"
                        info="Connexion inactive"
                        progress={0}
                        progressColor="bg-ds-border"
                        usage="Aucune utilisation"
                    />

                    {/* Google Calendar */}
                    <IntegrationCard
                        icon={<Calendar size={28} />}
                        title="Google Calendar"
                        subtitle="Planification automatique des entretiens"
                        status="not_configured"
                        info="Connexion inactive"
                        progress={0}
                        progressColor="bg-ds-border"
                        usage="Aucune synchronisation"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
