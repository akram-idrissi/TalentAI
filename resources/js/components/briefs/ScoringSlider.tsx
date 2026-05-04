import type { ScoringWeights } from '@/types/brief';

// One distinct color per criterion (matching the screenshot)
const WEIGHT_COLORS: Record<keyof ScoringWeights, { track: string; text: string; accent: string }> = {
    experience: { track: '#6C63FF', text: 'text-ds-accent', accent: '#6C63FF' },
    education: { track: '#38BDF8', text: 'text-ds-accent3', accent: '#38BDF8' },
    sector: { track: '#34D399', text: 'text-score-high', accent: '#34D399' },
    soft_skills: { track: '#FBBF24', text: 'text-score-mid', accent: '#FBBF24' },
    location: { track: '#9993B8', text: 'text-ds-text3', accent: '#9993B8' },
};

const WEIGHT_LABELS: Record<keyof ScoringWeights, string> = {
    experience: 'Expérience poste',
    education: 'Parcours académique',
    sector: "Secteur d'activité",
    soft_skills: 'Soft skills',
    location: 'Localisation',
};

interface ScoringSliderProps {
    weights: ScoringWeights;
    onChange: (weights: ScoringWeights) => void;
    error?: string;
}

export default function ScoringSlider({ weights, onChange, error }: ScoringSliderProps) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const totalColor = total === 100 ? 'text-score-high' : total > 100 ? 'text-ds-red' : 'text-score-mid';

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-ds-text3 text-[11px] font-semibold tracking-[0.8px] uppercase">Poids des critères pour le scoring IA</p>
                <span className={`text-[12px] font-bold ${totalColor}`}>{total}/100</span>
            </div>

            <div className="space-y-4">
                {(Object.keys(weights) as Array<keyof ScoringWeights>).map((key) => {
                    const { track, text } = WEIGHT_COLORS[key];
                    const val = weights[key];

                    return (
                        <div key={key} className="flex items-center gap-3">
                            <span className="text-ds-text2 w-[130px] shrink-0 text-[12px]">{WEIGHT_LABELS[key]}</span>

                            <div className="relative flex-1">
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={val}
                                    onChange={(e) => onChange({ ...weights, [key]: Number(e.target.value) })}
                                    className="scoring-range w-full cursor-pointer"
                                    style={
                                        {
                                            '--track-color': track,
                                            '--fill-pct': `${val}%`,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>

                            <span className={`w-8 shrink-0 text-right text-[12px] font-bold ${text}`}>{val}%</span>
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-ds-red mt-2 text-[11px]">{error}</p>}
        </div>
    );
}
