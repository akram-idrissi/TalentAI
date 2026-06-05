import BriefAvatar from '@/components/briefs/BriefAvatar';
import BulkActionBar from '@/components/briefs/BulkActionBar';
import ColumnVisibilityToggle from '@/components/briefs/ColumnVisibilityToggle';
import ContractBadge from '@/components/briefs/ContractBadge';
import FilterChips from '@/components/briefs/FilterChips';
import MobileBriefCard from '@/components/briefs/MobileBriefCard';
import Pagination from '@/components/briefs/Pagination';
import SortableHeader from '@/components/briefs/SortableHeader';
import StatusBadge from '@/components/briefs/StatusBadge';
import DeleteModal from '@/components/ui/DeleteModal';
import FilterPanel, { FilterEntry } from '@/components/ui/FilterPanel';
import SkeletonTable from '@/components/ui/SkeletonTable';
import type { ColKey } from '@/constants/briefs';
import { ALL_COLUMNS, STATUS_CONFIG, TOGGLEABLE_COLUMNS } from '@/constants/briefs';
import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import type { Brief, IndexBriefProps, SortDir } from '@/types/brief';
import { loadVisibleCols, saveVisibleCols } from '@/utils/briefs';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CheckSquare, Copy, Edit2, Eye, Plus, Square, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

dayjs.extend(relativeTime);
dayjs.locale('fr');

export default function Index({
    briefs: initialBriefs,
    filters,
    params,
    brief_statuses,
    sort_by: initialSortBy = 'created_at',
    sort_dir: initialSortDir = 'desc',
}: IndexBriefProps & { sort_by?: string; sort_dir?: string }) {
    const { t } = useI18n();
    const { can, isSuperAdmin } = usePermission();
    const canCreateBriefs = isSuperAdmin() || can('briefs.create');
    const canEditBriefs = isSuperAdmin() || can('briefs.edit');
    const canDeleteBriefs = isSuperAdmin() || can('briefs.delete');

    const [deletingBrief, setDeletingBrief] = useState<Brief | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterEntry[]>(Array.isArray(filters) ? filters : []);
    const [briefs, setBriefs] = useState(initialBriefs);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [sortDir, setSortDir] = useState<SortDir>(initialSortDir as SortDir);
    const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(loadVisibleCols);

    const translatedToggleableColumns = TOGGLEABLE_COLUMNS.map((column) => ({
        ...column,
        label: t(`briefs.index.column_visibility.columns.${column.key}`),
    }));

    useEffect(() => {
        setBriefs(initialBriefs);
    }, [initialBriefs]);
    useEffect(() => {
        setSelectedIds(new Set());
    }, [initialBriefs]);

    // ── Column visibility ─────────────────────────────────────────────────────

    function handleColVisibilityChange(key: string, checked: boolean) {
        setVisibleCols((prev) => {
            const next = new Set(prev) as Set<ColKey>;
            if (checked) {
                next.add(key as ColKey);
            } else {
                if (key !== 'title') next.delete(key as ColKey);
            }
            saveVisibleCols(next);
            return next;
        });
    }

    // Shorthand used in the tbody — returns true if the column should render
    function col(key: ColKey): boolean {
        return visibleCols.has(key);
    }

    // ── Sort ──────────────────────────────────────────────────────────────────

    function handleSort(column: string) {
        const newDir: SortDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);

        const cleanFilters = activeFilters
            .filter((f) => (Array.isArray(f.value) ? f.value.length > 0 : f.value?.toString().trim() !== ''))
            .map((f) => ({ field: f.field, value: Array.isArray(f.value) ? f.value.join(',') : f.value }));

        router.get(
            route('dashboard.briefs.index'),
            {
                sort_by: column,
                sort_dir: newDir,
                ...(cleanFilters.length ? { filters: JSON.stringify(cleanFilters) } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    // ── Status change (optimistic) ────────────────────────────────────────────

    function handleStatusChanged(briefId: number, newStatus: string) {
        setBriefs((prev) => ({
            ...prev,
            data: prev.data.map((b) => (b.id === briefId ? { ...b, status: newStatus } : b)),
        }));
    }

    // ── Selection ─────────────────────────────────────────────────────────────

    function toggleSelect(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }

    function toggleSelectAll() {
        setSelectedIds(selectedIds.size === briefs.data.length ? new Set() : new Set(briefs.data.map((b) => b.id)));
    }

    const allSelected = briefs.data.length > 0 && selectedIds.size === briefs.data.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    // ── Bulk status change ────────────────────────────────────────────────────

    async function handleBulkStatusChange(newStatus: string) {
        if (selectedIds.size === 0 || bulkLoading) return;
        setBulkLoading(true);

        const ids = Array.from(selectedIds);
        const previousStates = Object.fromEntries(briefs.data.filter((b) => ids.includes(b.id)).map((b) => [b.id, b.status]));

        setBriefs((prev) => ({
            ...prev,
            data: prev.data.map((b) => (ids.includes(b.id) ? { ...b, status: newStatus } : b)),
        }));

        try {
            const res = await fetch(route('dashboard.briefs.bulk-update-status'), {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ ids, status: newStatus }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error('Server error');

            const label = STATUS_CONFIG[newStatus]?.label ?? newStatus;

            toast.success(
                (t) => (
                    <span className="flex items-center gap-3">
                        <span>
                            {data.updated} brief(s) → <strong>{label}</strong>
                        </span>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                setBriefs((prev) => ({
                                    ...prev,
                                    data: prev.data.map((b) =>
                                        ids.includes(b.id) && previousStates[b.id] ? { ...b, status: previousStates[b.id] } : b,
                                    ),
                                }));
                                ids.forEach((id) => {
                                    if (!previousStates[id]) return;
                                    fetch(route('dashboard.briefs.update-status', id), {
                                        method: 'PATCH',
                                        credentials: 'same-origin',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Accept: 'application/json',
                                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                                            'X-Requested-With': 'XMLHttpRequest',
                                        },
                                        body: JSON.stringify({ status: previousStates[id] }),
                                    }).catch(() => {});
                                });
                                toast.success('Action annulée.');
                            }}
                            className="text-ds-accent ml-1 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold underline-offset-2 hover:underline"
                        >
                            Annuler
                        </button>
                    </span>
                ),
                { duration: 5000 },
            );

            setSelectedIds(new Set());
        } catch {
            setBriefs((prev) => ({
                ...prev,
                data: prev.data.map((b) => (ids.includes(b.id) && previousStates[b.id] ? { ...b, status: previousStates[b.id] } : b)),
            }));
            toast.error('Impossible de mettre à jour les briefs.');
        } finally {
            setBulkLoading(false);
        }
    }

    // ── Bulk delete ───────────────────────────────────────────────────────────

    async function handleBulkDelete() {
        if (selectedIds.size === 0 || bulkLoading) return;

        const ids = Array.from(selectedIds);
        const count = ids.length;
        const label = `${count} brief${count > 1 ? 's' : ''}`;

        if (!window.confirm(`Supprimer ${label} ? Cette action est irréversible.`)) return;

        setBulkLoading(true);

        try {
            const res = await fetch(route('dashboard.briefs.bulk-destroy'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ ids }),
            });

            if (!res.ok) throw new Error('Server error');

            setBriefs((prev) => ({
                ...prev,
                data: prev.data.filter((b) => !ids.includes(b.id)),
                total: Math.max(0, (prev.total ?? 0) - count),
            }));
            setSelectedIds(new Set());
            toast.success(`${label} supprimé${count > 1 ? 's' : ''}.`);
        } catch {
            toast.error('Impossible de supprimer les briefs.');
        } finally {
            setBulkLoading(false);
        }
    }

    // ── Filters ───────────────────────────────────────────────────────────────

    const FILTER_FIELDS = [
        { key: 'title', label: t('briefs.index.filters.fields.title'), type: 'text' as const },
        { key: 'sector', label: t('briefs.index.filters.fields.sector'), type: 'select' as const, multi: true, options: params.sectors },
        {
            key: 'contract_type',
            label: t('briefs.index.filters.fields.contract_type'),
            type: 'select' as const,
            multi: true,
            options: params.contract_types,
        },
        { key: 'location', label: t('briefs.index.filters.fields.location'), type: 'text' as const },
        { key: 'min_experience_years', label: t('briefs.index.filters.fields.min_experience_years'), type: 'number' as const },
        {
            key: 'education_level',
            label: t('briefs.index.filters.fields.education_level'),
            type: 'select' as const,
            multi: true,
            options: params.education_levels,
        },
        { key: 'status', label: t('briefs.index.filters.fields.status'), type: 'select' as const, multi: true, options: brief_statuses },
    ];

    const FILTER_FIELD_LABELS = Object.fromEntries(FILTER_FIELDS.map((f) => [f.key, f.label]));

    function removeFilter(field: string) {
        const next = activeFilters.filter((f) => f.field !== field);
        setActiveFilters(next);
        handleSearch(next);
    }

    function clearAllFilters() {
        setActiveFilters([]);
        handleSearch([]);
    }

    function handleDelete() {
        if (!deletingBrief) return;
        router.delete(route('dashboard.briefs.destroy', deletingBrief.id), {
            onSuccess: () => setDeletingBrief(null),
        });
    }

    function handleDuplicate(brief: Brief) {
        if (duplicatingId !== null) return;
        setDuplicatingId(brief.id);
        router.post(
            route('dashboard.briefs.duplicate', brief.id),
            {},
            {
                onFinish: () => setDuplicatingId(null),
                onError: () => toast.error('Impossible de dupliquer ce brief.'),
            },
        );
    }

    function handleSearch(filtersOverride?: FilterEntry[]) {
        const toSearch = filtersOverride ?? activeFilters;
        const cleanFilters = toSearch
            .filter((f) => (Array.isArray(f.value) ? f.value.length > 0 : f.value && (f.value as string).trim() !== ''))
            .map((f) => ({ field: f.field, value: Array.isArray(f.value) ? f.value.join(',') : f.value }));

        router.get(
            route('dashboard.briefs.index'),
            {
                filters: JSON.stringify(cleanFilters),
                sort_by: sortBy !== 'created_at' ? sortBy : undefined,
                sort_dir: sortDir !== 'desc' ? sortDir : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
                onSuccess: (page) => {
                    const total = (page.props as { briefs?: { total?: number } }).briefs?.total ?? 0;
                    toast.success(`${total} brief${total !== 1 ? 's' : ''} trouvé${total !== 1 ? 's' : ''}`);
                },
                onError: () => toast.error(t('briefs.index.flash.index_error')),
            },
        );
    }

    const serialisedFilters = JSON.stringify(
        activeFilters
            .filter((f) => (Array.isArray(f.value) ? f.value.length > 0 : f.value?.toString().trim() !== ''))
            .map((f) => ({ field: f.field, value: Array.isArray(f.value) ? f.value.join(',') : f.value })),
    );

    const SORTABLE_COLS = ALL_COLUMNS.map((c) => ({
        col: c.key,
        label: t(`briefs.index.sortable_columns.${c.key}`),
    }));

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            <Head title={t('briefs.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-screen px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 pt-2">
                        <h1 className="font-heading text-ds-text text-[22px] font-bold sm:text-[26px]">{t('briefs.index.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-[13px] sm:text-[14px]">{t('briefs.index.subtitle')}</p>
                    </div>

                    {/* Toolbar */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex-1">
                            <FilterPanel
                                fields={FILTER_FIELDS}
                                activeFilters={activeFilters}
                                onChange={setActiveFilters}
                                onSearch={handleSearch}
                                loading={loading}
                            />
                        </div>

                        {/* Column toggle — desktop only, sits between FilterPanel and create button */}
                        <div className="hidden md:block">
                            <ColumnVisibilityToggle
                                columns={translatedToggleableColumns}
                                visible={visibleCols}
                                onChange={handleColVisibilityChange}
                            />
                        </div>

                        {canCreateBriefs && (
                            <Link
                                href={route('dashboard.briefs.create')}
                                className="bg-ds-accent flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 sm:shrink-0 sm:justify-start"
                            >
                                <Plus size={14} />
                                {t('briefs.index.actions.create')}
                            </Link>
                        )}
                    </div>

                    {/* Filter chips */}
                    <FilterChips filters={activeFilters} fieldLabels={FILTER_FIELD_LABELS} onRemove={removeFilter} onClearAll={clearAllFilters} />

                    {/* Skeleton */}
                    {loading && <SkeletonTable cols={8} rows={8} />}

                    {/* Empty state */}
                    {!loading && briefs.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-20 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <span className="text-2xl">📋</span>
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('briefs.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('briefs.index.empty.description')}</p>
                            {canCreateBriefs && (
                                <Link
                                    href={route('dashboard.briefs.create')}
                                    className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                                >
                                    <Plus size={14} />
                                    {t('briefs.index.actions.create')}
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Desktop table */}
                    {!loading && briefs.data.length > 0 && (
                        <>
                            <div className="border-ds-border bg-ds-surface hidden overflow-hidden rounded-xl border md:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-[13px]">
                                        <thead>
                                            <tr className="border-ds-border border-b">
                                                {/* Select-all — always visible */}
                                                <th className="px-4 py-3 text-left">
                                                    <button
                                                        onClick={toggleSelectAll}
                                                        aria-label={allSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
                                                        className="text-ds-text3 hover:text-ds-accent flex items-center transition"
                                                    >
                                                        {allSelected ? (
                                                            <CheckSquare size={15} className="text-ds-accent" />
                                                        ) : someSelected ? (
                                                            <span className="border-ds-accent bg-ds-accent/20 flex h-[15px] w-[15px] items-center justify-center rounded-sm border">
                                                                <span className="bg-ds-accent h-[7px] w-[7px] rounded-sm" />
                                                            </span>
                                                        ) : (
                                                            <Square size={15} />
                                                        )}
                                                    </button>
                                                </th>

                                                {/* Sortable headers — conditionally rendered per visibility */}
                                                {SORTABLE_COLS.map(({ col: colKey, label }) =>
                                                    visibleCols.has(colKey as ColKey) ? (
                                                        <th key={colKey} className="px-4 py-3 text-left">
                                                            <SortableHeader
                                                                col={colKey}
                                                                label={label}
                                                                sortBy={sortBy}
                                                                sortDir={sortDir}
                                                                onSort={handleSort}
                                                            />
                                                        </th>
                                                    ) : null,
                                                )}

                                                {/* Actions — always visible */}
                                                <th className="px-4 py-3" />
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {briefs.data.map((brief, index) => {
                                                const isSelected = selectedIds.has(brief.id);
                                                return (
                                                    <tr
                                                        key={brief.id}
                                                        className={[
                                                            'border-ds-border border-b transition-colors last:border-0',
                                                            isSelected ? 'bg-ds-accent/5' : 'hover:bg-ds-bg3/40',
                                                        ].join(' ')}
                                                    >
                                                        {/* Checkbox — always visible */}
                                                        <td className="px-4 py-3.5">
                                                            <button
                                                                onClick={() => toggleSelect(brief.id)}
                                                                aria-label={isSelected ? 'Désélectionner' : 'Sélectionner'}
                                                                className="text-ds-text3 hover:text-ds-accent flex items-center transition"
                                                            >
                                                                {isSelected ? (
                                                                    <CheckSquare size={15} className="text-ds-accent" />
                                                                ) : (
                                                                    <Square size={15} />
                                                                )}
                                                            </button>
                                                        </td>

                                                        {/* title — always visible */}
                                                        {col('title') && (
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center gap-3">
                                                                    <BriefAvatar title={brief.title} index={index} />
                                                                    <div className="min-w-0">
                                                                        <p className="font-heading text-ds-text max-w-[200px] truncate font-semibold">
                                                                            {brief.title}
                                                                        </p>
                                                                        <p className="text-ds-text3 truncate text-[11px]">
                                                                            {brief.location} · {brief.min_experience_years} ans exp.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {col('sector') && <td className="text-ds-text2 px-4 py-3.5">{brief.sector}</td>}

                                                        {col('contract_type') && (
                                                            <td className="px-4 py-3.5">
                                                                <ContractBadge type={brief.contract_type} />
                                                            </td>
                                                        )}

                                                        {col('min_experience_years') && (
                                                            <td className="text-ds-text2 px-4 py-3.5">{brief.min_experience_years} ans</td>
                                                        )}

                                                        {col('location') && <td className="text-ds-text2 px-4 py-3.5">{brief.location}</td>}

                                                        {col('status') && (
                                                            <td className="px-4 py-3.5">
                                                                <StatusBadge
                                                                    brief={brief}
                                                                    onStatusChanged={handleStatusChanged}
                                                                    canEdit={canEditBriefs}
                                                                />
                                                            </td>
                                                        )}

                                                        {col('created_at') && (
                                                            <td className="text-ds-text3 px-4 py-3.5 text-[12px]">
                                                                {dayjs(brief.created_at).fromNow()}
                                                            </td>
                                                        )}

                                                        {/* Actions — always visible */}
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link
                                                                    href={route('dashboard.briefs.show', brief.id)}
                                                                    aria-label={t('briefs.index.actions.view')}
                                                                    title={t('briefs.index.actions.view')}
                                                                    className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                >
                                                                    <Eye size={13} />
                                                                </Link>
                                                                {canEditBriefs && (
                                                                    <Link
                                                                        href={route('dashboard.briefs.edit', brief.id)}
                                                                        aria-label={t('briefs.index.actions.edit')}
                                                                        title={t('briefs.index.actions.edit')}
                                                                        className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </Link>
                                                                )}
                                                                {canCreateBriefs && (
                                                                    <button
                                                                        onClick={() => handleDuplicate(brief)}
                                                                        disabled={duplicatingId === brief.id}
                                                                        aria-label="Dupliquer ce brief"
                                                                        title="Dupliquer ce brief"
                                                                        className={`border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition ${duplicatingId === brief.id ? 'animate-pulse cursor-wait opacity-60' : ''}`}
                                                                    >
                                                                        <Copy size={13} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setDeletingBrief(brief)}
                                                                    aria-label={t('briefs.index.actions.delete')}
                                                                    title={t('briefs.index.actions.delete')}
                                                                    className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-4 pb-4">
                                    <Pagination meta={briefs} filters={serialisedFilters} sortBy={sortBy} sortDir={sortDir} />
                                </div>
                            </div>

                            {/* Mobile card list — column visibility doesn't apply */}
                            <div className="md:hidden">
                                {briefs.data.map((brief, index) => (
                                    <MobileBriefCard
                                        key={brief.id}
                                        brief={brief}
                                        index={index}
                                        canEdit={canEditBriefs}
                                        canCreate={canCreateBriefs}
                                        selected={selectedIds.has(brief.id)}
                                        onToggleSelect={toggleSelect}
                                        onStatusChanged={handleStatusChanged}
                                        onDelete={setDeletingBrief}
                                        onDuplicate={handleDuplicate}
                                        duplicating={duplicatingId === brief.id}
                                    />
                                ))}
                                <Pagination meta={briefs} filters={serialisedFilters} sortBy={sortBy} sortDir={sortDir} />
                            </div>
                        </>
                    )}

                    {/* Delete modal — single */}
                    {deletingBrief && (
                        <DeleteModal
                            label={deletingBrief.title}
                            i18nPrefix="briefs.index.modal"
                            onConfirm={handleDelete}
                            onCancel={() => setDeletingBrief(null)}
                        />
                    )}
                </div>

                {/* Floating bulk action bar */}
                <BulkActionBar
                    count={selectedIds.size}
                    canEdit={canEditBriefs}
                    canDelete={canDeleteBriefs}
                    onStatusChange={handleBulkStatusChange}
                    onDelete={handleBulkDelete}
                    onClear={() => setSelectedIds(new Set())}
                />
            </AppLayout>
        </>
    );
}
