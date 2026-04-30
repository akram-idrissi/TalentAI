import { Badge } from '@/components/Badge';
import DataTable from '@/components/data-table';
import { RankBadge } from '@/components/RankBadge';
import { TableActions } from '@/components/TableActions';
import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { Brief, IndexBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
dayjs.extend(relativeTime);
dayjs.locale('fr');

export default function Index({ briefs, filters }: IndexBriefProps) {
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deletingBrief, setDeletingBrief] = useState<Brief | null>(null);

    function confirmDelete(brief: Brief) {
        setDeletingBrief(brief);
    }

    function handleDelete() {
        if (!deletingBrief) return;
        router.delete(route('briefs.destroy', deletingBrief.id), {
            onSuccess: () => setDeletingBrief(null),
        });
    }

    function handleSearch() {
        router.get(route('briefs.index'), { search }, { preserveState: true });
    }

    function handleReset() {
        setSearch('');
        router.get(route('briefs.index'));
    }

    return (
        <>
            <Head title={t('briefs.index.title')} />
            <AppSidebarLayout>
                <div className="min-h-screen bg-gray-50 px-6 py-10 transition-colors duration-300 dark:bg-[#0f1117]">
                    {/* HEADER */}
                    <div className="mb-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-500 uppercase">{t('briefs.index.breadcrumb')}</p>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('briefs.index.title')}</h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('briefs.index.subtitle')}</p>
                            </div>

                            <Link
                                href={route('briefs.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:shadow-emerald-600/30"
                            >
                                <span className="text-lg leading-none">＋</span>
                                {t('briefs.index.actions.create')}
                            </Link>
                        </div>

                        {/* SEARCH BAR */}
                        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center dark:border-gray-700/50 dark:bg-[#17171F]">
                            <div className="relative flex-1">
                                {/* Search icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={t('briefs.index.search_placeholder')}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-sm text-gray-800 placeholder-gray-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none dark:border-gray-700 dark:bg-[#0f1117] dark:text-gray-100"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
                                >
                                    {t('briefs.index.actions.search')}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:border-gray-700 dark:bg-[#1E1E28] dark:text-gray-300 dark:hover:bg-[#2a2a35]"
                                >
                                    {t('briefs.index.actions.reset')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Empty state */}
                    {briefs.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{t('briefs.index.empty.title')}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('briefs.index.empty.description')}</p>
                            <Link
                                href={route('briefs.create')}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                {t('briefs.index.actions.create')}
                            </Link>
                        </div>
                    )}

                    {/* TABLE */}
                    {briefs.data.length > 0 && (
                        <DataTable
                            data={briefs.data}
                            columns={[
                                {
                                    header: '#',
                                    headerClassName: 'text-center',
                                    cellClassName: 'flex justify-center items-center',
                                    render: (_, index) => <RankBadge index={index} />,
                                },
                                {
                                    header: t('briefs.index.columns.title'),
                                    render: (b) => (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-white">{b.title}</span>
                                            <span className="text-xs text-gray-400">{b.location}</span>
                                        </div>
                                    ),
                                },
                                {
                                    header: t('briefs.index.columns.sector'),
                                    render: (b) => <Badge color="blue">{b.sector}</Badge>,
                                },
                                {
                                    header: t('briefs.index.columns.contract'),
                                    render: (b) => <Badge color="violet">{b.contract_type}</Badge>,
                                },
                                {
                                    header: t('briefs.index.columns.status'),
                                    render: (b) => (
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                b.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                            }`}
                                        >
                                            {t(`briefs.show_brief.statuses.${b.status}`)}
                                        </span>
                                    ),
                                },
                                {
                                    header: t('briefs.index.columns.gender_pref'),
                                    render: (b) => (
                                        <span
                                            className={`font-semibold ${
                                                b.gender_pref === 'M'
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : b.gender_pref === 'F'
                                                      ? 'text-red-600 dark:text-red-400'
                                                      : 'text-gray-400'
                                            }`}
                                        >
                                            {b.gender_pref === 'M'
                                                ? t('briefs.index.gender.male')
                                                : b.gender_pref === 'F'
                                                  ? t('briefs.index.gender.female')
                                                  : t('briefs.index.gender.any')}
                                        </span>
                                    ),
                                },
                                {
                                    header: t('briefs.index.columns.education'),
                                    render: (b) => <span className="text-gray-500 dark:text-gray-400">{b.education_level}</span>,
                                },
                                {
                                    header: t('briefs.index.columns.created_at'),
                                    render: (b) => <span className="text-green-600 dark:text-green-400">{dayjs(b.created_at).fromNow()}</span>,
                                },
                                {
                                    header: t('briefs.index.columns.actions'),
                                    headerClassName: 'text-center',
                                    cellClassName: 'text-center',
                                    render: (b) => (
                                        <TableActions>
                                            {/* View */}
                                            <Link
                                                href={route('briefs.show', b.id)}
                                                className="hover:text-blue-500"
                                                title={t('briefs.index.actions.view')}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                                    />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </Link>

                                            {/* Edit */}
                                            <Link
                                                href={route('briefs.edit', b.id)}
                                                className="hover:text-amber-500"
                                                title={t('briefs.index.actions.edit')}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                                    />
                                                </svg>
                                            </Link>

                                            {/* Delete */}
                                            <button
                                                onClick={() => confirmDelete(b)}
                                                className="hover:text-red-500"
                                                title={t('briefs.index.actions.delete')}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                    />
                                                </svg>
                                            </button>
                                        </TableActions>
                                    ),
                                },
                            ]}
                        />
                    )}
                </div>

                {/* DELETE MODAL */}
                {deletingBrief && <DeleteModal brief={deletingBrief} onConfirm={handleDelete} onCancel={() => setDeletingBrief(null)} />}
            </AppSidebarLayout>
        </>
    );
}
