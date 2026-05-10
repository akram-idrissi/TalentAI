import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { Candidat, CandidatStatus, IndexCandidatProps } from '@/types/Candidat';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ExternalLink, Plus, Search } from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    sourced: { label: 'Sourcé', className: 'bg-ds-bg3 text-ds-text2 border border-ds-border' },
    contacted: { label: 'Contacté', className: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' },
    interview: { label: 'Entretien', className: 'bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/20' },
    recommended: { label: 'Recommandé', className: 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25' },
    offer: { label: 'Offre', className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
    rejected: { label: 'Rejeté', className: 'bg-ds-red/10 text-ds-red border border-ds-red/20' },
};

const SOURCE_CONFIG: Record<string, { className: string }> = {
    linkedin: { className: 'bg-[#6C63FF]/15 text-[#818CF8] border border-[#6C63FF]/25' },
    indeed: { className: 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25' },
    default: { className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
};

function sourceStyle(source: string) {
    const key = source.toLowerCase();
    return SOURCE_CONFIG[key]?.className ?? SOURCE_CONFIG.default.className;
}

function scoreColor(score: number) {
    if (score >= 85) return 'text-[#34D399]';
    if (score >= 70) return 'text-[#818CF8]';
    if (score >= 55) return 'text-[#22D3EE]';
    return 'text-ds-text3';
}

const AVATAR_COLORS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#34D399] to-[#38BDF8]',
    'from-[#FBBF24] to-[#F87171]',
    'from-[#A78BFA] to-[#6C63FF]',
    'from-[#F87171] to-[#FBBF24]',
    'from-[#EC4899] to-[#818CF8]',
];

function CandidatAvatar({ name, index }: { name: string; index: number }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-[12px] font-bold text-white`}
        >
            {initials}
        </div>
    );
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

function Pagination({ meta, search }: { meta: PaginationMeta; search: string }) {
    const { current_page, last_page, from, to, total } = meta;
    if (last_page <= 1) return null;

    function goTo(page: number) {
        router.get(route('dashboard.candidats.index'), { page, ...(search ? { search } : {}) }, { preserveState: true, preserveScroll: false });
    }

    const pages = Array.from({ length: last_page }, (_, i) => i + 1);
    const visible = pages.filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2);

    const btnBase = 'flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-[12px] transition';
    const btnIdle = 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text';
    const btnActive = 'border-ds-accent bg-ds-accent text-white';
    const btnDisabled = 'border-ds-border text-ds-text3 cursor-not-allowed opacity-50';

    return (
        <div className="mt-4 flex items-center justify-between text-[13px]">
            <p className="text-ds-text3">{from != null && to != null ? `${from}–${to} sur ${total} candidats` : `${total} candidats`}</p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page === 1}
                    className={`${btnBase} ${current_page === 1 ? btnDisabled : btnIdle}`}
                >
                    <ChevronLeft size={13} />
                </button>
                {visible.map((p, i) => (
                    <span key={p} className="flex items-center gap-1">
                        {i > 0 && visible[i - 1] !== p - 1 && <span className="text-ds-text3 px-0.5">…</span>}
                        <button onClick={() => goTo(p)} className={`${btnBase} ${p === current_page ? btnActive : btnIdle}`}>
                            {p}
                        </button>
                    </span>
                ))}
                <button
                    onClick={() => goTo(current_page + 1)}
                    disabled={current_page === last_page}
                    className={`${btnBase} ${current_page === last_page ? btnDisabled : btnIdle}`}
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}

const STATUT_OPTIONS: { value: CandidatStatus | ''; label: string }[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'sourced', label: 'Sourcé' },
    { value: 'contacted', label: 'Contacté' },
    { value: 'interview', label: 'Entretien' },
    { value: 'recommended', label: 'Recommandé' },
    { value: 'offer', label: 'Offre' },
    { value: 'rejected', label: 'Rejeté' },
];

export default function Index({ candidats, filters }: IndexCandidatProps) {
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<CandidatStatus | ''>((filters.status as CandidatStatus | undefined) ?? '');
    const [deletingCandidat, setDeletingCandidat] = useState<Candidat | null>(null);

    function handleDelete() {
        if (!deletingCandidat) return;
        router.delete(route('dashboard.candidats.destroy', deletingCandidat.id), {
            onSuccess: () => setDeletingCandidat(null),
        });
    }

    function applyFilters(newSearch?: string, newStatus?: CandidatStatus | '') {
        const s = newSearch ?? search;
        const st = newStatus ?? statusFilter;
        router.get(route('dashboard.candidats.index'), { ...(s ? { search: s } : {}), ...(st ? { status: st } : {}) }, { preserveState: true });
    }

    const totalLabel = `${candidats.total} profil${candidats.total !== 1 ? 's' : ''} actif${candidats.total !== 1 ? 's' : ''} · Toutes sources confondues`;

    const COLUMNS = ['CANDIDAT', 'POSTE VISÉ', 'SOURCE', 'SCORE CV', 'SCORE ENTRETIEN', 'STATUT', ''];

    return (
        <>
            <Head title={t('candidats.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-ds-text text-3xl font-bold">{t('candidats.index.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-sm">{totalLabel}</p>
                    </div>

                    {/* Toolbar */}
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative min-w-[260px] flex-1">
                            <Search size={14} className="text-ds-text3 absolute top-1/2 left-3.5 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Rechercher un candidat..."
                                className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-xl border py-2.5 pr-4 pl-9 text-[13px] focus:outline-none"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                const v = e.target.value as CandidatStatus | '';
                                setStatusFilter(v);
                                applyFilters(undefined, v);
                            }}
                            className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent rounded-xl border px-4 py-2.5 text-[13px] focus:outline-none"
                        >
                            {STATUT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>

                        {/* Add button */}
                        <Link
                            href={route('dashboard.candidats.create')}
                            className="bg-ds-accent ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                        >
                            <Plus size={14} />
                            Ajouter manuellement
                        </Link>
                    </div>

                    {/* Empty state */}
                    {candidats.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-2xl border py-24 text-center">
                            <p className="text-ds-text text-[15px] font-semibold">{t('candidats.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('candidats.index.empty.description')}</p>
                            <Link
                                href={route('dashboard.candidats.create')}
                                className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                            >
                                <Plus size={14} />
                                {t('candidats.index.actions.create')}
                            </Link>
                        </div>
                    )}

                    {/* Table */}
                    {candidats.data.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-2xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border border-b">
                                            {COLUMNS.map((col, i) => (
                                                <th
                                                    key={i}
                                                    className="text-ds-text3 px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.8px] uppercase"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidats.data.map((candidat, index) => (
                                            <tr
                                                key={candidat.id}
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                {/* CANDIDAT */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <CandidatAvatar name={candidat.full_name} index={index} />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-ds-text max-w-[150px] truncate font-semibold">
                                                                    {candidat.full_name}
                                                                </p>
                                                                {candidat.linkedin_url && (
                                                                    <a
                                                                        href={candidat.linkedin_url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="text-ds-text3 shrink-0 transition hover:text-[#818CF8]"
                                                                        title="Voir profil LinkedIn"
                                                                    >
                                                                        <ExternalLink size={12} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <p className="text-ds-text3 max-w-[150px] truncate text-[11px]">
                                                                {[
                                                                    candidat.location,
                                                                    candidat.experience_years != null ? `${candidat.experience_years} ans` : null,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' · ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* POSTE VISÉ */}
                                                <td className="px-5 py-4">
                                                    <p className="text-ds-text2 max-w-[140px] truncate">
                                                        {candidat.brief_title ?? candidat.current_title ?? '—'}
                                                    </p>
                                                </td>

                                                {/* SOURCE */}
                                                <td className="px-5 py-4">
                                                    {candidat.source ? (
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${sourceStyle(candidat.source)}`}
                                                        >
                                                            {candidat.source}
                                                        </span>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>

                                                {/* SCORE CV */}
                                                <td className="px-5 py-4">
                                                    {candidat.score_cv != null ? (
                                                        <span className={`text-[13px] font-bold ${scoreColor(candidat.score_cv)}`}>
                                                            {candidat.score_cv}
                                                        </span>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>

                                                {/* SCORE ENTRETIEN */}
                                                <td className="px-5 py-4">
                                                    <span className="text-ds-text3">—</span>
                                                </td>

                                                {/* STATUT */}
                                                <td className="px-5 py-4">
                                                    {(() => {
                                                        const cfg = STATUS_CONFIG[candidat.status] ?? STATUS_CONFIG.sourced;
                                                        return (
                                                            <span
                                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}
                                                            >
                                                                {cfg.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-5 py-4">
                                                    <Link
                                                        href={route('dashboard.candidats.show', candidat.id)}
                                                        className="border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text rounded-xl border px-3 py-1.5 text-[12px] transition"
                                                    >
                                                        Voir
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-5 pb-4">
                                <Pagination meta={candidats} search={search} />
                            </div>
                        </div>
                    )}
                </div>

                {deletingCandidat && (
                    <DeleteModal
                        label={deletingCandidat.full_name}
                        i18nPrefix="candidats.index.modal"
                        onConfirm={handleDelete}
                        onCancel={() => setDeletingCandidat(null)}
                    />
                )}
            </AppLayout>
        </>
    );
}
