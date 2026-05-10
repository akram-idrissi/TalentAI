import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Award, Download, Linkedin as LI, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

interface Brief {
    id: number;
    title: string;
}

interface ScoreBreakdown {
    experience?: number;
    education?: number;
    sector?: number;
    soft_skills?: number;
    location?: number;
    required_skills?: number;
    [key: string]: number | undefined;
}

interface Candidate {
    id: number;
    name: string;
    role: string | null;
    company: string | null;
    location: string | null;
    experience_years: number | null;
    linkedin_url: string | null;
    skills: string[];
    summary: string | null;
    score: number;
    score_breakdown: ScoreBreakdown | null;
}

interface Props {
    briefs: Brief[];
    selectedBriefId: number | null;
    candidates: Candidate[];
}

const BREAKDOWN_META: Record<string, { label: string; bar: string; text: string }> = {
    experience: { label: 'Expérience', bar: 'bg-[#34D399]', text: 'text-[#34D399]' },
    education: { label: 'Formation', bar: 'bg-[#818CF8]', text: 'text-[#818CF8]' },
    sector: { label: 'Secteur', bar: 'bg-[#22D3EE]', text: 'text-[#22D3EE]' },
    soft_skills: { label: 'Leadership', bar: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' },
    location: { label: 'Localisation', bar: 'bg-ds-text3', text: 'text-ds-text2' },
    required_skills: { label: 'Compétences', bar: 'bg-[#F87171]', text: 'text-[#F87171]' },
};

const AVATAR_GRADIENTS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#22D3EE] to-[#34D399]',
    'from-[#F59E0B] to-[#F87171]',
    'from-[#EC4899] to-[#818CF8]',
    'from-[#38BDF8] to-[#6C63FF]',
    'from-[#34D399] to-[#22D3EE]',
];

function scoreColor(score: number) {
    if (score >= 85) return 'text-[#34D399]';
    if (score >= 65) return 'text-[#F59E0B]';
    return 'text-[#F87171]';
}

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

export default function ClassementIndex({ briefs, selectedBriefId, candidates }: Props) {
    const [selected, setSelected] = useState<Candidate | null>(candidates[0] ?? null);

    const currentBrief = briefs.find((b) => b.id === selectedBriefId) ?? null;

    function handleBriefChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const id = Number(e.target.value);
        if (!id) return;
        router.get(route('dashboard.classement'), { brief_id: id }, { preserveScroll: true });
    }

    const breakdown = selected?.score_breakdown ? Object.entries(selected.score_breakdown).filter(([, v]) => v !== undefined && v !== null) : [];

    const selectedIndex = candidates.findIndex((c) => c.id === selected?.id);

    return (
        <>
            <Head title="Classements IA" />
            <AppLayout>
                <div className="bg-ds-bg text-ds-text min-h-screen p-6">
                    {/* HEADER */}
                    <div className="mb-8">
                        <p className="text-ds-text3 text-xs">Candidats &rsaquo; Classement IA</p>

                        <h1 className="text-ds-text mt-1 text-4xl font-extrabold tracking-tight">
                            {currentBrief ? `Classement IA · ${currentBrief.title}` : 'Classements IA'}
                        </h1>

                        {candidates.length > 0 && (
                            <p className="text-ds-text2 mt-1.5 text-sm">
                                {candidates.length} candidat{candidates.length > 1 ? 's' : ''} analysé{candidates.length > 1 ? 's' : ''} · Triés par
                                score de correspondance global
                            </p>
                        )}

                        {/* brief switcher — minimal, below subtitle */}
                        {briefs.length > 1 && (
                            <select
                                value={selectedBriefId ?? ''}
                                onChange={handleBriefChange}
                                className="border-ds-border bg-ds-surface text-ds-text focus:border-ds-accent mt-3 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
                            >
                                {briefs.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.title}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* EMPTY STATE */}
                    {candidates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-28 text-center">
                            <Award size={52} className="text-ds-text3 mb-4" />
                            <h2 className="text-ds-text text-lg font-semibold">Aucun candidat classé</h2>
                            <p className="text-ds-text2 mt-1 max-w-xs text-sm">
                                {currentBrief
                                    ? "Lancez un sourcing pour ce brief afin d'obtenir un classement IA."
                                    : 'Sélectionnez un brief pour voir le classement IA des candidats.'}
                            </p>
                        </div>
                    )}

                    {candidates.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {/* ── CANDIDATE LIST ── */}
                            <div className="space-y-3 lg:col-span-2">
                                {candidates.map((c, index) => (
                                    <div
                                        key={c.id}
                                        onClick={() => setSelected(c)}
                                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-150 ${
                                            selected?.id === c.id
                                                ? 'border-ds-accent bg-ds-accent/10'
                                                : 'border-ds-border bg-ds-surface hover:border-ds-border2 hover:bg-ds-bg3'
                                        }`}
                                    >
                                        {/* rank badge */}
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                                index === 0
                                                    ? 'bg-[#F59E0B]/25 text-[#F59E0B]'
                                                    : index === 1
                                                      ? 'text-ds-text2 bg-white/10'
                                                      : index === 2
                                                        ? 'bg-[#cd7f32]/20 text-[#cd7f32]'
                                                        : 'bg-ds-bg3 text-ds-text3'
                                            }`}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* avatar */}
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${
                                                AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                                            }`}
                                        >
                                            {initials(c.name)}
                                        </div>

                                        {/* info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-ds-text flex items-center gap-1.5 text-[15px] font-semibold">
                                                {c.linkedin_url && <LI size={13} className="shrink-0 text-[#5b9bd5]" />}
                                                {c.name}
                                            </p>
                                            <p className="text-ds-text2 mt-0.5 text-xs">
                                                {[c.role, c.company, c.experience_years ? `${c.experience_years} ans` : null]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                            {c.skills.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {c.skills.slice(0, 4).map((s) => (
                                                        <span
                                                            key={s}
                                                            className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-md border px-2 py-0.5 text-[11px]"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* score */}
                                        <div className="shrink-0 text-right">
                                            <span className={`text-4xl leading-none font-bold ${scoreColor(c.score)}`}>{c.score}</span>
                                            <p className="text-ds-text3 mt-0.5 text-[11px]">/100</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── DETAIL PANEL ── */}
                            {selected && (
                                <div className="border-ds-border bg-ds-surface rounded-xl border p-6">
                                    {/* top: avatar + name */}
                                    <div className="border-ds-border border-b pb-5 text-center">
                                        <div
                                            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white ${
                                                AVATAR_GRADIENTS[selectedIndex % AVATAR_GRADIENTS.length]
                                            }`}
                                        >
                                            {initials(selected.name)}
                                        </div>

                                        <h2 className="text-ds-text mt-3 text-lg font-bold">{selected.name}</h2>

                                        <p className="text-ds-text2 mt-0.5 flex items-center justify-center gap-1 text-xs">
                                            <MapPin size={11} />
                                            {[selected.role, selected.company].filter(Boolean).join(' · ')}
                                        </p>

                                        <div className="mt-3 flex justify-center gap-2">
                                            {selected.linkedin_url && (
                                                <a
                                                    href={selected.linkedin_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 rounded-md border border-[#5b9bd5]/30 bg-[#5b9bd5]/10 px-2.5 py-1 text-xs font-medium text-[#5b9bd5]"
                                                >
                                                    <LI size={11} /> LinkedIn
                                                </a>
                                            )}
                                            {selected.score >= 85 && (
                                                <span className="rounded-md border border-[#34D399]/30 bg-[#34D399]/10 px-2.5 py-1 text-xs font-medium text-[#34D399]">
                                                    Top match
                                                </span>
                                            )}
                                        </div>

                                        <p className={`mt-4 text-6xl leading-none font-extrabold ${scoreColor(selected.score)}`}>{selected.score}</p>
                                        <p className="text-ds-text3 mt-1 text-xs">/100 · Score IA global</p>
                                    </div>

                                    {/* breakdown bars */}
                                    {breakdown.length > 0 && (
                                        <div className="mt-5 space-y-3.5">
                                            {breakdown.map(([key, value]) => {
                                                const meta = BREAKDOWN_META[key] ?? {
                                                    label: key,
                                                    bar: 'bg-ds-accent',
                                                    text: 'text-ds-accent',
                                                };
                                                return (
                                                    <div key={key} className="flex items-center gap-3">
                                                        <span className="text-ds-text2 w-24 shrink-0 text-xs">{meta.label}</span>
                                                        <div className="bg-ds-bg3 h-2 flex-1 overflow-hidden rounded-full">
                                                            <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${value}%` }} />
                                                        </div>
                                                        <span className={`w-8 shrink-0 text-right text-sm font-bold ${meta.text}`}>{value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Analyse IA */}
                                    <div className="mt-6">
                                        <h3 className="text-ds-text text-base font-bold">Analyse IA</h3>
                                        <p className="text-ds-text2 mt-2 text-sm leading-relaxed">
                                            {selected.summary ??
                                                'Profil solide avec une expérience pertinente pour ce poste. Les compétences techniques et le parcours correspondent aux exigences du brief. Candidat recommandé pour un entretien.'}
                                        </p>
                                        {selected.skills.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {selected.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-md border px-2.5 py-1 text-xs"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* actions */}
                                    <button className="bg-ds-accent mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90">
                                        <Phone size={14} />
                                        Planifier entretien
                                    </button>
                                    <button className="border-ds-border text-ds-text2 hover:bg-ds-bg3 mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm transition">
                                        <Download size={14} />
                                        Télécharger fiche
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
