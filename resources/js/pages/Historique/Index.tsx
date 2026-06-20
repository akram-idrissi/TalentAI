import FilterPanel, { FilterEntry, FilterField } from '@/components/ui/FilterPanel';
import { AVATAR_COLORS } from '@/constants/historique';
import { PLATFORM_LABEL } from '@/constants/interviews';
import AppLayout from '@/layouts/app-layout';
import { PaginatedInterviews, Props } from '@/types/historique';
import { entriesToParams, filtersToEntries, formatDate, scoreColor } from '@/utils/historique';
import { Head, Link, router } from '@inertiajs/react';
import { Award, Briefcase, Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useMemo, useState } from 'react';

const DECISION_CFG = {
    accepted: {
        label: 'Accepté',
        cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: <ThumbsUp size={11} />,
    },
    rejected: {
        label: 'Refusé',
        cls: 'bg-ds-red/10 text-ds-red border-ds-red/20',
        icon: <ThumbsDown size={11} />,
    },
    pending: {
        label: 'En attente',
        cls: 'bg-ds-text3/10 text-ds-text3 border-ds-text3/20',
        icon: <Clock size={11} />,
    },
} as const;

function avatar(name: string, index: number, photo: string | null) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    if (photo) {
        return <img src={photo} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover" />;
    }
    return (
        <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-[11px] font-bold text-white`}
        >
            {initials}
        </div>
    );
}

/** Convert the server-supplied flat filters object into FilterEntry[] for FilterPanel's initial state. */

/** Convert FilterPanel's FilterEntry[] back into a flat query-param object for router.get(). */

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ meta, params }: { meta: PaginatedInterviews; params: Record<string, string> }) {
    const { current_page, last_page, from, to, total } = meta;
    if (last_page <= 1) return null;

    function goTo(page: number) {
        router.get(
            route('dashboard.historique.index'),
            { ...params, page },
            {
                preserveState: true,
                preserveScroll: false,
            },
        );
    }

    const pages = Array.from({ length: last_page }, (_, i) => i + 1);
    const visible = pages.filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2);
    const btn = 'flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-[12px] transition';

    return (
        <div className="mt-4 flex items-center justify-between px-5 pb-4 text-[13px]">
            <p className="text-ds-text3">{from != null && to != null ? `${from}–${to} sur ${total} entretiens` : `${total} entretiens`}</p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page === 1}
                    className={`${btn} ${current_page === 1 ? 'border-ds-border text-ds-text3 cursor-not-allowed opacity-50' : 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text'}`}
                >
                    <ChevronLeft size={13} />
                </button>
                {visible.map((p, i) => (
                    <span key={p} className="flex items-center gap-1">
                        {i > 0 && visible[i - 1] !== p - 1 && <span className="text-ds-text3 px-0.5">…</span>}
                        <button
                            onClick={() => goTo(p)}
                            className={`${btn} ${p === current_page ? 'border-ds-accent bg-ds-accent text-white' : 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text'}`}
                        >
                            {p}
                        </button>
                    </span>
                ))}
                <button
                    onClick={() => goTo(current_page + 1)}
                    disabled={current_page === last_page}
                    className={`${btn} ${current_page === last_page ? 'border-ds-border text-ds-text3 cursor-not-allowed opacity-50' : 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text'}`}
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoriqueIndex({ interviews, briefs, filters: initialFilters }: Props) {
    const [activeFilters, setActiveFilters] = useState<FilterEntry[]>(filtersToEntries(initialFilters));
    const [loading, setLoading] = useState(false);

    const FILTER_FIELDS: FilterField[] = [
        { key: 'candidat_name', label: 'Candidat', type: 'text' },
        {
            key: 'brief_id',
            label: 'Brief',
            type: 'select',
            options: briefs.map((b) => ({ value: b.id, label: b.title })),
        },
        {
            key: 'decision',
            label: 'Décision',
            type: 'select',
            options: [
                { value: 'accepted', label: 'Accepté' },
                { value: 'rejected', label: 'Refusé' },
                { value: 'pending', label: 'En attente' },
            ],
        },
        { key: 'date_from', label: 'Date début', type: 'date' },
        { key: 'date_to', label: 'Date fin', type: 'date' },
    ];

    const appliedParams = useMemo(() => entriesToParams(activeFilters), [activeFilters]);

    function handleSearch(filtersOverride?: FilterEntry[]) {
        const toSearch = filtersOverride ?? activeFilters;
        const params = entriesToParams(toSearch);

        router.get(route('dashboard.historique.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    }

    const activeCount = activeFilters.filter((f) => {
        const v = Array.isArray(f.value) ? f.value.join('') : f.value;
        return v && String(v).trim() !== '';
    }).length;

    return (
        <AppLayout>
            <Head title="Historique des candidatures" />

            <div className="bg-ds-bg min-h-full px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="font-heading text-ds-text text-[26px] font-bold">Historique des candidatures</h1>
                    <p className="text-ds-text2 mt-1 text-[14px]">
                        {interviews.total} entretien{interviews.total !== 1 ? 's' : ''} au total
                        {activeCount > 0 && (
                            <span className="text-ds-accent ml-1">
                                · {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-5">
                    <FilterPanel
                        fields={FILTER_FIELDS}
                        activeFilters={activeFilters}
                        onChange={setActiveFilters}
                        onSearch={handleSearch}
                        loading={loading}
                    />
                </div>

                {/* Empty state */}
                {interviews.data.length === 0 && (
                    <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-2xl border px-6 py-24 text-center">
                        <div className="bg-ds-accent/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                            <Clock size={22} className="text-ds-accent" />
                        </div>
                        <p className="text-ds-text mb-1 text-[15px] font-semibold">Aucun entretien trouvé</p>
                        <p className="text-ds-text3 text-[13px]">
                            {activeCount > 0
                                ? 'Aucun résultat pour ces filtres. Essayez de les réinitialiser.'
                                : "Aucun entretien n'a encore été enregistré."}
                        </p>
                    </div>
                )}

                {/* Table */}
                {interviews.data.length > 0 && (
                    <div className="border-ds-border bg-ds-surface overflow-hidden rounded-2xl border">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-[13px]">
                                <thead>
                                    <tr className="border-ds-border border-b">
                                        {['CANDIDAT', 'BRIEF', 'DATE', 'PLATEFORME', 'SCORE IA', 'DÉCISION', 'DÉCIDÉ PAR', ''].map((col, i) => (
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
                                    {interviews.data.map((interview, index) => {
                                        const dec = DECISION_CFG[interview.decision];

                                        return (
                                            <tr
                                                key={interview.id}
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                <td className="px-5 py-4">
                                                    {interview.candidat ? (
                                                        <div className="flex items-center gap-2.5">
                                                            {avatar(interview.candidat.full_name, index, interview.candidat.profile_photo)}
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="text-ds-text max-w-[140px] truncate text-[12px] font-semibold">
                                                                        {interview.candidat.full_name}
                                                                    </p>
                                                                    {interview.candidat.linkedin_url && (
                                                                        <a
                                                                            href={interview.candidat.linkedin_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="text-ds-text3 shrink-0 transition hover:text-[#818CF8]"
                                                                        >
                                                                            <ExternalLink size={11} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <p className="text-ds-text3 max-w-[140px] truncate text-[11px]">
                                                                    {interview.candidat.current_title ?? interview.candidat.headline ?? '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    {interview.brief ? (
                                                        <div>
                                                            <p className="text-ds-text max-w-[160px] truncate text-[12px] font-medium">
                                                                {interview.brief.title}
                                                            </p>
                                                            <p className="text-ds-text3 text-[11px]">
                                                                {interview.brief.sector}
                                                                {interview.brief.contract_type && ` · ${interview.brief.contract_type}`}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-ds-text2 flex items-center gap-1.5 text-[12px]">
                                                        <Calendar size={11} className="text-ds-text3 shrink-0" />
                                                        {formatDate(interview.scheduled_at)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-ds-text2 text-[12px]">
                                                        {PLATFORM_LABEL[interview.platform] ?? interview.platform}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {interview.ai_score != null ? (
                                                        <span className={`text-[13px] font-bold ${scoreColor(interview.ai_score)}`}>
                                                            <Award size={11} className="mr-1 inline" />
                                                            {interview.ai_score}
                                                        </span>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${dec.cls}`}
                                                    >
                                                        {dec.icon}
                                                        {dec.label}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {interview.decision_by ? (
                                                        <div>
                                                            <p className="text-ds-text2 text-[12px] font-medium">{interview.decision_by.name}</p>
                                                            {interview.decision_at && (
                                                                <p className="text-ds-text3 text-[11px]">{formatDate(interview.decision_at)}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-ds-text3">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <Link
                                                        href={route('dashboard.candidats.historique', interview.candidat?.id)}
                                                        className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-xl border transition"
                                                        title="Voir l'historique du candidat"
                                                    >
                                                        <Briefcase size={12} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <Pagination meta={interviews} params={appliedParams} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
