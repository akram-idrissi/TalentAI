import { Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Edit2, ExternalLink, Eye, Trash2 } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('fr');

interface Candidat {
    id: number;
    full_name: string;
    current_title?: string;
    email?: string;
    current_company?: string;
    location?: string;
    experience_years?: number;
    source?: string;
    status: string;
    created_at: string;
    open_to_work?: boolean;
    ai_score?: number;
    linkedin_url?: string;
}

interface Props {
    data: Candidat[];
    onDelete?: (candidat: Candidat) => void;
}

function getScoreColor(score: number) {
    if (score >= 90) {
        return 'text-ds-green';
    }

    if (score >= 75) {
        return 'text-ds-accent2';
    }

    if (score >= 60) {
        return 'text-ds-amber';
    }

    return 'text-ds-red';
}

function getRankStyle(index: number) {
    if (index === 0) {
        return 'bg-ds-amber/15 text-ds-amber border border-ds-amber/30';
    }

    if (index === 1) {
        return 'bg-slate-400/10 text-slate-400 border border-slate-400/20';
    }

    if (index === 2) {
        return 'bg-orange-400/10 text-orange-300 border border-orange-300/20';
    }

    return 'bg-ds-bg3 text-ds-text3 border border-ds-border';
}

function SourceBadge({ source }: { source?: string }) {
    if (!source) {
        return (
            <span className="border-ds-border text-ds-text3 inline-flex rounded-full border bg-white/5 px-2.5 py-1 text-[11px] font-semibold">—</span>
        );
    }

    const isLinkedin = source.toLowerCase().includes('linkedin');

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                isLinkedin ? 'border-ds-accent/20 bg-ds-accent/10 text-ds-accent2' : 'border-ds-amber/20 bg-ds-amber/10 text-ds-amber'
            }`}
        >
            {source}
        </span>
    );
}

export default function CandidateTable({ data, onDelete }: Props) {
    return (
        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-2xl border">
            {/* Header */}
            <div className="border-ds-border flex items-center justify-between border-b px-5 py-4">
                <div>
                    <h2 className="font-heading text-ds-text text-[15px] font-semibold">Profils sourcés & filtrés par IA</h2>

                    <p className="text-ds-text3 mt-1 text-[12px]">{data.length} candidats analysés</p>
                </div>

                <button
                    onClick={() => router.visit(route('dashboard.classement'))}
                    className="bg-ds-accent rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#7C74FF]"
                >
                    Voir le classement
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-ds-border border-b">
                            {['#', 'Candidat', 'Source', 'Poste actuel', 'Expérience', 'Score IA', 'Action'].map((col) => (
                                <th key={col} className="text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((candidat, index) => {
                            const score = candidat.ai_score ?? Math.floor(Math.random() * 40) + 60;

                            return (
                                <tr key={candidat.id} className="border-ds-border border-b transition hover:bg-white/[0.02]">
                                    {/* Rank */}
                                    <td className="px-4 py-3">
                                        <div
                                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold ${getRankStyle(
                                                index,
                                            )}`}
                                        >
                                            {index + 1}
                                        </div>
                                    </td>

                                    {/* Candidate */}
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-heading text-ds-text text-[13px] font-semibold">{candidat.full_name}</p>

                                                {candidat.linkedin_url && (
                                                    <a
                                                        href={candidat.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-ds-text3 hover:bg-ds-accent/10 hover:text-ds-accent2 flex h-5 w-5 items-center justify-center rounded-md transition"
                                                        title="Voir LinkedIn"
                                                    >
                                                        <ExternalLink size={13} />
                                                    </a>
                                                )}

                                                {candidat.open_to_work && (
                                                    <span className="border-ds-green/20 bg-ds-green/10 text-ds-green rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                                                        Open To Work
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="text-ds-text3 text-[11px]">{candidat.location ?? 'Non définie'}</span>

                                                <span className="text-ds-text3 text-[11px]">•</span>

                                                <span className="text-ds-text3 truncate text-[11px]">{candidat.email}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Source */}
                                    <td className="px-4 py-3">
                                        <SourceBadge source={candidat.source} />
                                    </td>

                                    {/* Current Job */}
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-ds-text text-[12px]">{candidat.current_title ?? '—'}</p>

                                            {candidat.current_company && (
                                                <p className="text-ds-text3 mt-0.5 text-[11px]">{candidat.current_company}</p>
                                            )}
                                        </div>
                                    </td>

                                    {/* Experience */}
                                    <td className="text-ds-text2 px-4 py-3 text-[13px]">
                                        {candidat.experience_years != null ? `${candidat.experience_years} ans` : '—'}
                                    </td>

                                    {/* AI Score */}
                                    <td className="px-4 py-3">
                                        <span className={`font-heading text-[18px] font-bold ${getScoreColor(score)}`}>{score}</span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={route('dashboard.candidats.show', candidat.id)}
                                                className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-8 w-8 items-center justify-center rounded-lg border transition"
                                            >
                                                <Eye size={14} />
                                            </Link>

                                            <Link
                                                href={route('dashboard.candidats.edit', candidat.id)}
                                                className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-8 w-8 items-center justify-center rounded-lg border transition"
                                            >
                                                <Edit2 size={14} />
                                            </Link>

                                            <button
                                                onClick={() => onDelete?.(candidat)}
                                                className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-8 w-8 items-center justify-center rounded-lg border transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="border-ds-border flex items-center justify-between border-t px-5 py-4">
                <p className="text-ds-text3 text-[12px]">{data.length} profils affichés</p>

                <div className="flex items-center gap-2">
                    <div className="bg-ds-green h-2 w-2 rounded-full"></div>

                    <span className="text-ds-text2 text-[12px]">Sourcing IA actif</span>
                </div>
            </div>
        </div>
    );
}
