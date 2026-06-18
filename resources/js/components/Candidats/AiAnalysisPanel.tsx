import { useState } from 'react';

interface AnalysisSection {
    accroche: string;
    parcours: string;
    competences_cles: string;
    formation: string;
    points_forts: string[];
    points_attention: string[];
    verdict: string;
}

interface AnalysisData {
    fr: AnalysisSection;
    en: AnalysisSection;
}

interface Props {
    aiAnalysis: string | null | undefined;
    /** If provided, shows a "Générer" button when analysis is missing */
    onGenerate?: () => void;
    generating?: boolean;
}

function parseAnalysis(raw: string | null | undefined): AnalysisData | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed?.fr && parsed?.en) return parsed as AnalysisData;
    } catch {
        // not structured JSON — legacy plain string, ignore
    }
    return null;
}

export default function AiAnalysisPanel({ aiAnalysis, onGenerate, generating }: Props) {
    const [lang, setLang] = useState<'fr' | 'en'>('fr');

    const data = parseAnalysis(aiAnalysis);

    if (!data) {
        return (
            <div className="border-ds-border bg-ds-surface rounded-2xl border p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-ds-text text-[13px] font-semibold">Synthèse IA</h2>
                </div>
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <p className="text-ds-text3 text-[12px]">Aucune synthèse disponible pour ce candidat.</p>
                    {onGenerate && (
                        <button
                            onClick={onGenerate}
                            disabled={generating}
                            className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {generating ? (
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path
                                        d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                            {generating ? 'Génération…' : 'Générer la synthèse'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const section = data[lang];

    return (
        <div className="border-ds-border bg-ds-surface rounded-2xl border p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-ds-text text-[13px] font-semibold">Synthèse IA</h2>
                <div className="border-ds-border inline-flex overflow-hidden rounded-lg border text-[11px]">
                    {(['fr', 'en'] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-3 py-1 font-semibold uppercase transition ${
                                lang === l ? 'bg-ds-accent text-white' : 'text-ds-text3 hover:text-ds-text'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accroche */}
            <p className="text-ds-text mb-4 text-[13px] leading-relaxed font-medium italic">"{section.accroche}"</p>

            <div className="space-y-4">
                {/* Parcours */}
                <div>
                    <p className="text-ds-text3 mb-1 text-[10px] font-semibold tracking-[0.7px] uppercase">
                        {lang === 'fr' ? 'Parcours' : 'Career Path'}
                    </p>
                    <p className="text-ds-text2 text-[12px] leading-relaxed">{section.parcours}</p>
                </div>

                {/* Compétences */}
                <div>
                    <p className="text-ds-text3 mb-1 text-[10px] font-semibold tracking-[0.7px] uppercase">
                        {lang === 'fr' ? 'Compétences clés' : 'Key Skills'}
                    </p>
                    <p className="text-ds-text2 text-[12px] leading-relaxed">{section.competences_cles}</p>
                </div>

                {/* Formation */}
                <div>
                    <p className="text-ds-text3 mb-1 text-[10px] font-semibold tracking-[0.7px] uppercase">
                        {lang === 'fr' ? 'Formation' : 'Education'}
                    </p>
                    <p className="text-ds-text2 text-[12px] leading-relaxed">{section.formation}</p>
                </div>

                {/* Points forts */}
                {section.points_forts?.length > 0 && (
                    <div>
                        <p className="text-ds-text3 mb-1.5 text-[10px] font-semibold tracking-[0.7px] uppercase">
                            {lang === 'fr' ? 'Points forts' : 'Strengths'}
                        </p>
                        <ul className="space-y-1">
                            {section.points_forts.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-[12px]">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#34D399]" />
                                    <span className="text-ds-text2">{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Points d'attention */}
                {section.points_attention?.length > 0 && (
                    <div>
                        <p className="text-ds-text3 mb-1.5 text-[10px] font-semibold tracking-[0.7px] uppercase">
                            {lang === 'fr' ? "Points d'attention" : 'Concerns'}
                        </p>
                        <ul className="space-y-1">
                            {section.points_attention.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-[12px]">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                                    <span className="text-ds-text2">{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Verdict */}
                <div className="border-ds-border rounded-xl border p-3">
                    <p className="text-ds-text3 mb-1 text-[10px] font-semibold tracking-[0.7px] uppercase">{lang === 'fr' ? 'Verdict' : 'Verdict'}</p>
                    <p className="text-ds-text text-[12px] leading-relaxed font-medium">{section.verdict}</p>
                </div>
            </div>
        </div>
    );
}
