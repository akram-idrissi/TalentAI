import DeleteModal from '@/components/ui/DeleteModal';
import AppLayout from '@/layouts/app-layout';
import type { Candidat } from '@/types/candidat';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    sourced: { label: 'Sourcé', className: 'bg-ds-bg3 text-ds-text2 border border-ds-border' },
    contacted: { label: 'Contacté', className: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' },
    interview: { label: 'Entretien', className: 'bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/20' },
    recommended: { label: 'Recommandé', className: 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25' },
    offer: { label: 'Offre', className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
    rejected: { label: 'Rejeté', className: 'bg-ds-red/10 text-ds-red border border-ds-red/20' },
};

const AVATAR_COLORS = ['from-[#6C63FF] to-[#38BDF8]', 'from-[#34D399] to-[#38BDF8]', 'from-[#FBBF24] to-[#F87171]', 'from-[#A78BFA] to-[#6C63FF]'];

function avatar(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

function scoreColor(score: number) {
    if (score >= 85) return 'text-[#34D399]';
    if (score >= 70) return 'text-[#818CF8]';
    if (score >= 55) return 'text-[#22D3EE]';
    return 'text-ds-text3';
}

const card = 'bg-ds-surface border border-ds-border rounded-2xl p-5';
const labelCls = 'text-[11px] font-medium text-ds-text3 uppercase tracking-[0.6px] mb-1';
const valueCls = 'text-[13px] text-ds-text';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className={labelCls}>{label}</p>
            <p className={valueCls}>{value ?? '—'}</p>
        </div>
    );
}

interface Props {
    candidat: Candidat;
}

export default function ShowCandidat({ candidat }: Props) {
    const [showDelete, setShowDelete] = useState(false);

    const statusCfg = STATUS_CONFIG[candidat.status] ?? STATUS_CONFIG.sourced;
    const initials = avatar(candidat.full_name);
    const gradientIdx = candidat.id % AVATAR_COLORS.length;

    function handleDelete() {
        router.delete(route('dashboard.candidats.destroy', candidat.id), {
            onSuccess: () => router.visit(route('dashboard.candidats.index')),
        });
    }

    return (
        <AppLayout>
            <Head title={candidat.full_name} />

            <div className="bg-ds-bg min-h-full px-6 py-8">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Link
                            href={route('dashboard.candidats.index')}
                            className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:bg-ds-accent/[0.06] hover:text-ds-accent mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition"
                        >
                            <ChevronLeft size={16} />
                        </Link>
                        <div>
                            <p className="text-ds-text3 mb-1 text-[12px]">
                                <Link href={route('dashboard.candidats.index')} className="hover:text-ds-text2 transition">
                                    Candidats
                                </Link>{' '}
                                <span className="text-ds-text2">› {candidat.full_name}</span>
                            </p>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{candidat.full_name}</h1>
                            {candidat.headline && <p className="text-ds-text2 mt-0.5 text-[14px]">{candidat.headline}</p>}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            href={route('dashboard.candidats.edit', candidat.id)}
                            className="border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] transition"
                        >
                            <Pencil size={13} />
                            Modifier
                        </Link>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="border-ds-red/30 text-ds-red hover:bg-ds-red/5 flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] transition"
                        >
                            <Trash2 size={13} />
                            Supprimer
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* LEFT — identity card */}
                    <div className="space-y-5">
                        <div className={card}>
                            {/* Avatar + status */}
                            <div className="mb-5 flex items-center gap-4">
                                <div
                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[gradientIdx]} text-[16px] font-bold text-white`}
                                >
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-ds-text truncate font-semibold">{candidat.full_name}</p>
                                    <span
                                        className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.className}`}
                                    >
                                        {statusCfg.label}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <InfoRow label="Email" value={candidat.email} />
                                <InfoRow label="Téléphone" value={candidat.phone} />
                                <InfoRow label="Localisation" value={candidat.location} />
                                {candidat.linkedin_url && (
                                    <div>
                                        <p className={labelCls}>LinkedIn</p>
                                        <a
                                            href={candidat.linkedin_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[13px] text-[#818CF8] transition hover:underline"
                                        >
                                            Voir le profil <ExternalLink size={11} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scores */}
                        <div className={card}>
                            <h2 className="text-ds-text mb-4 text-[13px] font-semibold">Scores</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className={labelCls}>Score sourcing</p>
                                    {candidat.sourcing_score != null ? (
                                        <p className={`text-[20px] font-bold ${scoreColor(candidat.sourcing_score)}`}>{candidat.sourcing_score}</p>
                                    ) : (
                                        <p className="text-ds-text3 text-[13px]">—</p>
                                    )}
                                </div>
                                <div>
                                    <p className={labelCls}>Score entretien</p>
                                    {candidat.ai_score != null ? (
                                        <p className={`text-[20px] font-bold ${scoreColor(candidat.ai_score)}`}>{candidat.ai_score}</p>
                                    ) : (
                                        <p className="text-ds-text3 text-[13px]">—</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — details */}
                    <div className="space-y-5 lg:col-span-2">
                        <div className={card}>
                            <h2 className="text-ds-text mb-4 text-[13px] font-semibold">Expérience professionnelle</h2>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                                <InfoRow label="Poste actuel" value={candidat.current_title} />
                                <InfoRow label="Entreprise actuelle" value={candidat.current_company} />
                                <InfoRow
                                    label="Années d'expérience"
                                    value={candidat.experience_years != null ? `${candidat.experience_years} ans` : null}
                                />
                                <InfoRow label="Niveau d'éducation" value={candidat.education_level} />
                                <InfoRow label="Source" value={candidat.source} />
                                <InfoRow label="Open to work" value={candidat.open_to_work ? 'Oui' : 'Non'} />
                            </div>
                        </div>

                        {candidat.summary && (
                            <div className={card}>
                                <h2 className="text-ds-text mb-3 text-[13px] font-semibold">Résumé</h2>
                                <p className="text-ds-text2 text-[13px] leading-relaxed whitespace-pre-wrap">{candidat.summary}</p>
                            </div>
                        )}

                        {candidat.skills && candidat.skills.length > 0 && (
                            <div className={card}>
                                <h2 className="text-ds-text mb-3 text-[13px] font-semibold">Compétences</h2>
                                <div className="flex flex-wrap gap-2">
                                    {candidat.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center rounded-full bg-[#6C63FF]/10 px-2.5 py-1 text-[11px] font-medium text-[#818CF8]"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={card}>
                            <h2 className="text-ds-text mb-4 text-[13px] font-semibold">Métadonnées</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Créé le" value={new Date(candidat.created_at).toLocaleDateString('fr-FR')} />
                                <InfoRow label="Mis à jour le" value={new Date(candidat.updated_at).toLocaleDateString('fr-FR')} />
                                {candidat.source_url && (
                                    <div>
                                        <p className={labelCls}>URL Source</p>
                                        <a
                                            href={candidat.source_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[13px] text-[#818CF8] transition hover:underline"
                                        >
                                            Voir la source <ExternalLink size={11} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDelete && (
                <DeleteModal
                    label={candidat.full_name}
                    i18nPrefix="candidats.index.modal"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}
        </AppLayout>
    );
}
