import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Brief = {
    id: number;
    title: string;
    sector: string;
    contract_type: string;
    salary_range: string;
    location: string;
    status: string;
    created_at: string;
    created_by?: string;
};
type Filters = {
    search?: string;
};
type Props = {
    briefs: {
        data: Brief[];
    };
    filters: Filters;
};

export default function Index({ briefs }: Props) {
    const [search, setSearch] = useState('');

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this brief?')) {
            router.delete(route('briefs.destroy', id));
        }
    };

    return (
        <AppSidebarLayout>
            <div className="min-h-screen bg-gray-50 px-6 py-10 transition-colors duration-300 dark:bg-[#0f1117]">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="mb-1 text-xs font-semibold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">Recruitment</p>
                            <h1 className="text-secondary text-3xl font-bold tracking-tight">Briefs List</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {briefs.data.length} brief{briefs.data.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        <Link
                            href={route('briefs.create')}
                            className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg sm:self-auto"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create Brief
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <div className="relative max-w-md flex-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && router.get(route('briefs.index'), { search }, { preserveState: true })}
                                placeholder="Search by title..."
                                className="focus:ring-secondary/50 focus:border-secondary dark:focus:ring-secondary/30 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-800 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder-gray-500"
                            />
                        </div>

                        <button
                            onClick={() => router.get(route('briefs.index'), { search }, { preserveState: true })}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700"
                        >
                            Search
                        </button>

                        <button
                            onClick={() => router.get(route('briefs.index'))}
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/40">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-700/60 dark:bg-gray-800/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Title
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Sector
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Contract
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Salary
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Location
                                    </th>
                                    <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {briefs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1}
                                                    stroke="currentColor"
                                                    className="h-12 w-12 text-gray-300 dark:text-gray-600"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                                    />
                                                </svg>
                                                <p className="font-medium text-gray-400 dark:text-gray-500">No briefs found</p>
                                                <Link
                                                    href={route('briefs.create')}
                                                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                                                >
                                                    Create your first brief →
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    briefs.data.map((brief) => (
                                        <tr
                                            key={brief.id}
                                            className="group transition-colors duration-150 hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
                                        >
                                            {/* Title */}
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-gray-900 dark:text-white">{brief.title}</span>
                                            </td>

                                            {/* Sector */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {brief.sector}
                                                </span>
                                            </td>

                                            {/* Contract */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-800/40 dark:bg-violet-900/30 dark:text-violet-300">
                                                    {brief.contract_type}
                                                </span>
                                            </td>

                                            {/* Salary */}
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                    {brief.salary_range}
                                                </span>
                                            </td>

                                            {/* Location */}
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="h-3.5 w-3.5 shrink-0"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                        />
                                                    </svg>
                                                    {brief.location}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Show */}
                                                    <Link
                                                        href={route('briefs.show', brief.id)}
                                                        title="View"
                                                        className="rounded-lg p-2 text-gray-400 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                            />
                                                        </svg>
                                                    </Link>

                                                    {/* Edit */}
                                                    <Link
                                                        href={route('briefs.edit', brief.id)}
                                                        title="Edit"
                                                        className="rounded-lg p-2 text-gray-400 transition-all duration-150 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                            />
                                                        </svg>
                                                    </Link>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(brief.id)}
                                                        title="Delete"
                                                        className="rounded-lg p-2 text-gray-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
