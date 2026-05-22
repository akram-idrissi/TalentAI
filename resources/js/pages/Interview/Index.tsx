import { PLATFORMS, STATUSES } from '@/constants/interviews';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { IndexInterviewsProps } from '@/types/interviews';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import FilterChip from './components/FilterChip';
import InterviewIndexRow from './components/InterviewIndexRow';

export default function Index({ interviews }: IndexInterviewsProps) {
    const { t } = useI18n();
    const { data, current_page, last_page } = interviews;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [platformFilter, setPlatformFilter] = useState<string>('');

    const hasFilters = !!(search || statusFilter || platformFilter);

    const clearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('');
        setPlatformFilter('');
    }, []);

    const filtered = useMemo(() => {
        return data.filter((i) => {
            const matchSearch =
                !search ||
                i.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
                i.brief_title.toLowerCase().includes(search.toLowerCase());
            const matchStatus = !statusFilter || i.transcription_status === statusFilter;
            const matchPlatform = !platformFilter || i.platform === platformFilter;
            return matchSearch && matchStatus && matchPlatform;
        });
    }, [data, search, statusFilter, platformFilter]);

    const navigate = useCallback((page: number) => {
        router.get('/dashboard/interviews/list', { page }, { preserveScroll: true });
    }, []);

    return (
        <>
            <Head title={t('interviews.list.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* ── Header ── */}
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('interviews.list.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('interviews.list.subtitle')}</p>
                        </div>
                        <Link
                            href="/dashboard/interviews/create"
                            className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                        >
                            {t('interviews.list.new')}
                        </Link>
                    </div>

                    {/* ── Filters ── */}
                    <div className="border-ds-border bg-ds-surface mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3">
                        {/* Search */}
                        <div className="relative min-w-[220px] flex-1">
                            <Search size={13} className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('interviews.list.filters.search')}
                                className="border-ds-border bg-ds-bg text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border py-2 pr-3 pl-8 text-[13px] transition outline-none"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="text-ds-text3 hover:text-ds-text absolute top-1/2 right-3 -translate-y-1/2 transition"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="bg-ds-border hidden h-5 w-px sm:block" />

                        {/* Status chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-ds-text3 flex items-center gap-1 text-[11px] font-semibold tracking-[0.6px] uppercase">
                                <SlidersHorizontal size={11} />
                                {t('interviews.list.filters.status')}
                            </span>
                            {STATUSES.filter((s) => s !== 'none').map((s) => (
                                <FilterChip
                                    key={s}
                                    label={t(`interviews.list.status.${s}`).replace(/^[✓●~✕]\s*/, '')}
                                    active={statusFilter === s}
                                    onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                                    onClear={() => setStatusFilter('')}
                                />
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="bg-ds-border hidden h-5 w-px sm:block" />

                        {/* Platform chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-ds-text3 text-[11px] font-semibold tracking-[0.6px] uppercase">
                                {t('interviews.list.filters.platform')}
                            </span>
                            {PLATFORMS.map((p) => (
                                <FilterChip
                                    key={p}
                                    label={t(`interviews.list.platforms.${p}`)}
                                    active={platformFilter === p}
                                    onClick={() => setPlatformFilter(platformFilter === p ? '' : p)}
                                    onClear={() => setPlatformFilter('')}
                                />
                            ))}
                        </div>

                        {/* Clear all */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-ds-text3 hover:text-ds-red ml-auto flex items-center gap-1 text-[11px] transition"
                            >
                                <X size={11} />
                                {t('interviews.list.filters.clear')}
                            </button>
                        )}
                    </div>

                    {/* ── List ── */}
                    {filtered.length === 0 ? (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-20 text-center">
                            <span className="mb-3 text-3xl">{hasFilters ? '🔍' : '🎙️'}</span>
                            <p className="text-ds-text text-[14px] font-semibold">
                                {hasFilters ? t('interviews.list.empty.no_results') : t('interviews.list.empty.title')}
                            </p>
                            {!hasFilters && <p className="text-ds-text2 mt-1 text-[13px]">{t('interviews.list.empty.description')}</p>}
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-ds-accent mt-3 text-[13px] underline underline-offset-2 transition hover:opacity-75"
                                >
                                    {t('interviews.list.filters.clear')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filtered.map((interview) => (
                                <InterviewIndexRow key={interview.id} interview={interview} />
                            ))}
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-ds-text3 text-[12px]">
                                {t('interviews.list.pagination.summary', {
                                    current: current_page,
                                    last: last_page,
                                })}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={current_page === 1}
                                    onClick={() => navigate(current_page - 1)}
                                    className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-1 rounded-lg border px-3 py-2 text-[12px] transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={13} />
                                    {t('interviews.list.pagination.previous')}
                                </button>
                                <button
                                    disabled={current_page === last_page}
                                    onClick={() => navigate(current_page + 1)}
                                    className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-1 rounded-lg border px-3 py-2 text-[12px] transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {t('interviews.list.pagination.next')}
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
