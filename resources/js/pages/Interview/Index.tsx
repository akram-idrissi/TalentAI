import FilterPanel, { FilterEntry } from '@/components/ui/FilterPanel';
import { PLATFORMS, STATUSES } from '@/constants/interviews';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Mic, SearchX } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import InterviewIndexRow from './components/InterviewIndexRow';

export default function Index({ interviews, filters = [] }: Props) {
    const { t } = useI18n();
    const { data, current_page, last_page } = interviews;

    const [activeFilters, setActiveFilters] = useState<FilterEntry[]>(filters);
    const [loading, setLoading] = useState(false);

    const FILTER_FIELDS = [
        {
            key: 'candidate',
            label: 'Candidate',
            type: 'text' as const,
        },
        {
            key: 'brief',
            label: 'Brief',
            type: 'text' as const,
        },
        {
            key: 'status',
            label: t('interviews.list.filters.status'),
            type: 'select' as const,
            options: STATUSES.filter((s) => s !== 'none').map((s) => ({
                value: s,
                label: t(`interviews.list.status.${s}`),
            })),
        },
        {
            key: 'platform',
            label: t('interviews.list.filters.platform'),
            type: 'select' as const,
            options: PLATFORMS.map((p) => ({
                value: p,
                label: t(`interviews.list.platforms.${p}`),
            })),
        },
    ];

    const hasFilters = activeFilters.some((f) => f.value && String(f.value).trim() !== '');

    const clearFilters = useCallback(() => {
        setActiveFilters([]);

        router.get('/dashboard/interviews', {
            page: 1,
        });
    }, []);

    function handleSearch(filtersOverride?: FilterEntry[]) {
        const toSearch = filtersOverride ?? activeFilters;

        const cleanFilters = toSearch
            .filter((f) => f.value && String(f.value).trim() !== '')
            .map((f) => ({
                field: f.field,
                value: f.value,
            }));

        router.get(
            '/dashboard/interviews',
            {
                filters: JSON.stringify(cleanFilters),
                page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
                onError: () => toast.error('Erreur lors du filtrage'),
            },
        );
    }

    const navigate = useCallback(
        (page: number) => {
            router.get(
                '/dashboard/interviews',
                {
                    page,
                    filters: JSON.stringify(activeFilters),
                },
                { preserveScroll: true },
            );
        },
        [activeFilters],
    );
    const filtered = useMemo(() => {
        const search = activeFilters.find((f) => f.field === 'search')?.value ?? '';
        const status = activeFilters.find((f) => f.field === 'status')?.value ?? '';
        const platform = activeFilters.find((f) => f.field === 'platform')?.value ?? '';

        return data.filter((i) => {
            const matchSearch =
                !search ||
                i.candidate_name.toLowerCase().includes(String(search).toLowerCase()) ||
                i.brief_title.toLowerCase().includes(String(search).toLowerCase());

            const matchStatus = !status || i.transcription_status === status;
            const matchPlatform = !platform || i.platform === platform;

            return matchSearch && matchStatus && matchPlatform;
        });
    }, [data, activeFilters]);

    return (
        <>
            <Head title={t('interviews.list.title')} />

            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* HEADER */}
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

                    {/* FILTERS */}
                    <div className="py-3">
                        <FilterPanel
                            fields={FILTER_FIELDS}
                            activeFilters={activeFilters}
                            onChange={setActiveFilters}
                            onSearch={handleSearch}
                            loading={loading}
                        />
                    </div>

                    {/* LIST */}
                    {filtered.length === 0 ? (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-20 text-center">
                            {/* ICONS ONLY (NO EMOJI) */}
                            <div className="mb-3">
                                {hasFilters ? <SearchX size={42} className="text-ds-text3" /> : <Mic size={42} className="text-ds-text3" />}
                            </div>

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

                    {/* PAGINATION */}
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
                                    className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-1 rounded-lg border px-3 py-2 text-[12px] transition disabled:opacity-40"
                                >
                                    <ChevronLeft size={13} />
                                    {t('interviews.list.pagination.previous')}
                                </button>

                                <button
                                    disabled={current_page === last_page}
                                    onClick={() => navigate(current_page + 1)}
                                    className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-1 rounded-lg border px-3 py-2 text-[12px] transition disabled:opacity-40"
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
