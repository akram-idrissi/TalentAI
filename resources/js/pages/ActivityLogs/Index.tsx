import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types/activity_logs';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Activity, Eye, RotateCcw, Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import { ActionBadge } from './components/ActionBadge';
import { HttpMethodBadge } from './components/HttpMethodBadge';
import { Pagination } from './components/Pagination';
import { UserAvatar } from './components/UserAvatar';
dayjs.extend(relativeTime);
dayjs.locale('fr');
export default function ActivityLogsIndex({ logs, actionGroups, filters }: PageProps) {
    const { t } = useI18n();

    const [search, setSearch] = useState(filters.search ?? '');
    const [action, setAction] = useState(filters.action ?? '');
    const [user, setUser] = useState(filters.user ?? '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
    const [dateTo, setDateTo] = useState(filters.dateTo ?? '');

    function handleSearch() {
        router.get(route('dashboard.activity-logs.index'), { search, action, user, date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    }

    function handleReset() {
        setSearch('');
        setAction('');
        setUser('');
        setDateFrom('');
        setDateTo('');
        router.get(route('dashboard.activity-logs.index'));
    }

    const TABLE_COLS = [
        t('activity_logs.index.table.user'),
        t('activity_logs.index.table.action'),
        t('activity_logs.index.table.description'),
        t('activity_logs.index.table.method'),
        t('activity_logs.index.table.ip'),
        t('activity_logs.index.table.date'),
        '',
    ];

    return (
        <>
            <Head title={t('activity_logs.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-ds-accent/10 flex h-9 w-9 items-center justify-center rounded-xl">
                                <Activity size={16} className="text-ds-accent" />
                            </div>
                            <div>
                                <h1 className="font-heading text-ds-text text-[26px] leading-none font-bold">{t('activity_logs.index.title')}</h1>
                                <p className="text-ds-text2 mt-0.5 text-[14px]">{t('activity_logs.index.subtitle')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="mb-5 flex flex-col gap-3">
                        {/* Row 1 — search + user */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search size={14} className="text-ds-text3 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={t('activity_logs.index.filters.search_placeholder')}
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                                />
                            </div>
                            <div className="relative flex-1 sm:max-w-[220px]">
                                <Search size={14} className="text-ds-text3 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={t('activity_logs.index.filters.user_placeholder')}
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Row 2 — action group + dates + buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent focus:ring-ds-accent/20 rounded-lg border py-2.5 pr-8 pl-3 text-[13px] focus:ring-1 focus:outline-none"
                            >
                                <option value="">{t('activity_logs.index.filters.all_actions')}</option>
                                {actionGroups.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent focus:ring-ds-accent/20 rounded-lg border px-3 py-2.5 text-[13px] focus:ring-1 focus:outline-none"
                                title={t('activity_logs.index.filters.date_from')}
                            />
                            <span className="text-ds-text3 text-[12px]">→</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent focus:ring-ds-accent/20 rounded-lg border px-3 py-2.5 text-[13px] focus:ring-1 focus:outline-none"
                                title={t('activity_logs.index.filters.date_to')}
                            />

                            <button
                                onClick={handleSearch}
                                className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#7C74FF]"
                            >
                                {t('activity_logs.index.actions.filter')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] transition"
                            >
                                <RotateCcw size={13} />
                                {t('activity_logs.index.actions.reset')}
                            </button>
                        </div>
                    </div>

                    {/* Empty state */}
                    {logs.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Activity size={24} className="text-ds-accent" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('activity_logs.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('activity_logs.index.empty.description')}</p>
                        </div>
                    )}

                    {/* Table */}
                    {logs.data.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border border-b">
                                            {TABLE_COLS.map((col, i) => (
                                                <th
                                                    key={i}
                                                    className="text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.data.map((log, index) => (
                                            <tr key={log.id} className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0">
                                                {/* User */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <UserAvatar name={log.user_name} index={index} />
                                                        <div className="min-w-0">
                                                            <p className="text-ds-text truncate font-medium">
                                                                {log.user_name ?? (
                                                                    <span className="text-ds-text3 italic">
                                                                        {t('activity_logs.index.unknown_user')}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-ds-text3 truncate text-[11px]">{log.user_email ?? '—'}</p>
                                                        </div>
                                                        <span
                                                            className="ml-1 shrink-0"
                                                            title={
                                                                log.is_authenticated
                                                                    ? t('activity_logs.index.auth.authenticated')
                                                                    : t('activity_logs.index.auth.not_authenticated')
                                                            }
                                                        >
                                                            {log.is_authenticated ? (
                                                                <ShieldCheck size={13} className="text-badge-active-text" />
                                                            ) : (
                                                                <ShieldOff size={13} className="text-ds-red" />
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-4 py-3.5">
                                                    <ActionBadge action={log.action} />
                                                </td>

                                                {/* Description */}
                                                <td className="text-ds-text2 max-w-[280px] px-4 py-3.5">
                                                    <p className="line-clamp-2 text-[12px] leading-relaxed">{log.description || '—'}</p>
                                                </td>

                                                {/* HTTP method */}
                                                <td className="px-4 py-3.5">
                                                    <HttpMethodBadge method={log.http_method} />
                                                </td>

                                                {/* IP */}
                                                <td className="text-ds-text3 px-4 py-3.5 font-mono text-[11px]">{log.ip_address ?? '—'}</td>

                                                {/* Date */}
                                                <td className="text-ds-text3 px-4 py-3.5 text-[12px]">{dayjs(log.logged_at).fromNow()}</td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('dashboard.activity-logs.show', log.id)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('activity_logs.index.actions.view')}
                                                        >
                                                            <Eye size={13} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-4 pb-4">
                                <Pagination meta={logs} filters={{ search, action, user, dateFrom, dateTo }} t={t} />
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
