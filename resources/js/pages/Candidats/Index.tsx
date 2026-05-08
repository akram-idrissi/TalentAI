import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { Candidat, IndexCandidatProps } from '@/types/Candidat';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Briefcase, ChevronLeft, ChevronRight, Edit2, Eye, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

dayjs.extend(relativeTime);
dayjs.locale('fr');

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    sourced: { label: 'Sourcé', className: 'bg-ds-bg3 text-ds-text2 border border-ds-border' },
    contacted: { label: 'Contacté', className: 'bg-badge-sourcing-bg text-badge-sourcing-text border border-badge-sourcing-text/20' },
    interview: { label: 'Entretien', className: 'bg-badge-interview-bg text-badge-interview-text border border-badge-interview-text/20' },
    recommended: { label: 'Recommandé', className: 'bg-badge-active-bg text-badge-active-text border border-badge-active-text/20' },
    offer: { label: 'Offre', className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
    rejected: { label: 'Rejeté', className: 'bg-ds-red/10 text-ds-red border border-ds-red/20' },
};

function CandidatStatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-ds-bg3 text-ds-text2 border border-ds-border' };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

const AVATAR_COLORS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#34D399] to-[#38BDF8]',
    'from-[#FBBF24] to-[#F87171]',
    'from-[#A78BFA] to-[#6C63FF]',
    'from-[#F87171] to-[#FBBF24]',
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
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-[11px] font-bold text-white`}
        >
            {initials}
        </div>
    );
}

function OpenToWorkBadge() {
    return (
        <span className="border-badge-active-text/20 bg-badge-active-bg text-badge-active-text inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold">
            Open
        </span>
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
                {/* Prev */}
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page === 1}
                    className={`${btnBase} ${current_page === 1 ? btnDisabled : btnIdle}`}
                    aria-label="Page précédente"
                >
                    <ChevronLeft size={13} />
                </button>

                {/* Page numbers */}
                {visible.map((p, i) => (
                    <span key={p} className="flex items-center gap-1">
                        {i > 0 && visible[i - 1] !== p - 1 && <span className="text-ds-text3 px-0.5">…</span>}
                        <button
                            onClick={() => goTo(p)}
                            className={`${btnBase} ${p === current_page ? btnActive : btnIdle}`}
                            aria-current={p === current_page ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    </span>
                ))}

                {/* Next */}
                <button
                    onClick={() => goTo(current_page + 1)}
                    disabled={current_page === last_page}
                    className={`${btnBase} ${current_page === last_page ? btnDisabled : btnIdle}`}
                    aria-label="Page suivante"
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}

export default function Index({ candidats, filters }: IndexCandidatProps) {
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deletingCandidat, setDeletingCandidat] = useState<Candidat | null>(null);

    function handleDelete() {
        if (!deletingCandidat) return;
        router.delete(route('dashboard.candidats.destroy', deletingCandidat.id), {
            onSuccess: () => setDeletingCandidat(null),
        });
    }

    function handleSearch() {
        router.get(route('dashboard.candidats.index'), { search }, { preserveState: true });
    }

    function handleReset() {
        setSearch('');
        router.get(route('dashboard.candidats.index'));
    }

    return (
        <>
            <Head title={t('candidats.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('candidats.index.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">{t('candidats.index.subtitle')}</p>
                    </div>

                    {/* Toolbar */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search size={14} className="text-ds-text3 absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('candidats.index.search_placeholder')}
                                className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSearch}
                                className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#7C74FF]"
                            >
                                {t('candidats.index.actions.search')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] transition"
                            >
                                <RotateCcw size={13} />
                                {t('candidats.index.actions.reset')}
                            </button>
                            <Link
                                href={route('dashboard.candidats.create')}
                                className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('candidats.index.actions.create')}
                            </Link>
                        </div>
                    </div>

                    {/* Empty state */}
                    {candidats.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Briefcase className="text-ds-accent" size={24} />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('candidats.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('candidats.index.empty.description')}</p>
                            <Link
                                href={route('dashboard.candidats.create')}
                                className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('candidats.index.actions.create')}
                            </Link>
                        </div>
                    )}

                    {/* Table */}
                    {candidats.data.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border border-b">
                                            {['candidat', 'current_position', 'experience', 'location', 'source', 'status', 'created_at', ''].map(
                                                (col) => (
                                                    <th
                                                        key={col}
                                                        className="text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase"
                                                    >
                                                        {col ? t(`candidats.index.columns.${col}`) : ''}
                                                    </th>
                                                ),
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidats.data.map((candidat, index) => (
                                            <tr
                                                key={candidat.id}
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <CandidatAvatar name={candidat.full_name} index={index} />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="font-heading text-ds-text truncate font-semibold">
                                                                    {candidat.full_name}
                                                                </p>
                                                                {candidat.open_to_work && <OpenToWorkBadge />}
                                                            </div>
                                                            <p className="text-ds-text3 truncate text-[11px]">{candidat.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="text-ds-text2 truncate">{candidat.current_title ?? '—'}</p>
                                                    {candidat.current_company && (
                                                        <p className="text-ds-text3 truncate text-[11px]">{candidat.current_company}</p>
                                                    )}
                                                </td>
                                                <td className="text-ds-text2 px-4 py-3.5">
                                                    {candidat.experience_years != null ? `${candidat.experience_years} ans` : '—'}
                                                </td>
                                                <td className="text-ds-text2 px-4 py-3.5">{candidat.location ?? '—'}</td>
                                                <td className="px-4 py-3.5">
                                                    {candidat.source ? (
                                                        <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                            {candidat.source}
                                                        </span>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <CandidatStatusBadge status={candidat.status} />
                                                </td>
                                                <td className="text-ds-text3 px-4 py-3.5 text-[12px]">{dayjs(candidat.created_at).fromNow()}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('dashboard.candidats.show', candidat.id)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('candidats.index.actions.view')}
                                                        >
                                                            <Eye size={13} />
                                                        </Link>
                                                        <Link
                                                            href={route('dashboard.candidats.edit', candidat.id)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('candidats.index.actions.edit')}
                                                        >
                                                            <Edit2 size={13} />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeletingCandidat(candidat)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('candidats.index.actions.delete')}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination ── */}
                            <div className="px-4 pb-4">
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
