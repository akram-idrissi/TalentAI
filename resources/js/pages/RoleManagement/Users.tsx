import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { PageProps, User } from '@/types/users';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit2, Plus, Search, Shield, Trash2, UserCheck, Users, UserX, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreateUserModal } from './components/CreateUserModal';
import { EditRolesModal } from './components/EditRolesModal';
import { FlashMessage } from './components/FlashMessage';
import { UserAvatar } from './components/UserAvatar';
import { ROLE_COLORS } from './constants';

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UsersIndex() {
    const { users, roles, flash, auth, filters } = usePage<PageProps>().props;
    const { t } = useI18n();
    const { can } = usePermission();

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [visibleFlash, setVisibleFlash] = useState({
        success: Boolean(flash.success),
        error: Boolean(flash.error),
    });

    const [search, setSearch] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? '');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setVisibleFlash({ success: Boolean(flash.success), error: Boolean(flash.error) });
    }, [flash]);

    const applyFilters = useCallback((newSearch: string, newRole: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            router.get(
                route('dashboard.users.index'),
                {
                    ...(newSearch ? { search: newSearch } : {}),
                    ...(newRole ? { role: newRole } : {}),
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        applyFilters(value, roleFilter);
    };

    const handleRoleChange = (value: string) => {
        setRoleFilter(value);
        applyFilters(search, value);
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        applyFilters('', '');
    };

    const hasActiveFilters = search !== '' || roleFilter !== '';

    const toggleUserStatus = (user: User) => {
        const routeName = user.is_active ? 'dashboard.users.deactivate' : 'dashboard.users.activate';
        router.patch(route(routeName, user.id), {}, { preserveScroll: true });
    };

    const deleteUser = (user: User) => {
        if (!confirm(t('users.index.delete_confirm', { name: user.full_name ?? user.name }))) return;
        router.delete(route('dashboard.users.delete', user.id), { preserveScroll: true });
    };

    const subtitle = users.total === 1 ? t('users.index.subtitle_one') : t('users.index.subtitle_other', { count: users.total });

    const TABLE_COLS = [
        t('users.index.table.user'),
        t('users.index.table.roles'),
        t('users.index.table.last_login'),
        t('users.index.table.joined'),
        '',
    ];

    return (
        <>
            <Head title={t('users.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Flash */}
                    {flash.success && visibleFlash.success && (
                        <FlashMessage type="success" message={flash.success} onClose={() => setVisibleFlash((p) => ({ ...p, success: false }))} />
                    )}
                    {flash.error && visibleFlash.error && (
                        <FlashMessage type="error" message={flash.error} onClose={() => setVisibleFlash((p) => ({ ...p, error: false }))} />
                    )}

                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('users.index.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{subtitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={route('dashboard.roles.index')}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition"
                            >
                                <Shield size={14} />
                                {t('users.index.nav.roles')}
                            </a>
                            {can('users.create') && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                                >
                                    <Plus size={14} />
                                    {t('users.index.actions.create')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Search & filter bar ─────────────────────────────── */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        {/* Search input */}
                        <div className="relative max-w-sm min-w-[200px] flex-1">
                            <Search size={14} className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder={t('users.index.search.placeholder')}
                                className="border-ds-border bg-ds-surface text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/30 w-full rounded-lg border py-2 pr-3 pl-8 text-[13px] transition outline-none focus:ring-1"
                            />
                        </div>

                        {/* Role filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="border-ds-border bg-ds-surface text-ds-text focus:border-ds-accent focus:ring-ds-accent/30 rounded-lg border px-3 py-2 text-[13px] transition outline-none focus:ring-1"
                        >
                            <option value="">{t('users.index.search.all_roles')}</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {t(`users.roles.${role.name}`, { fallback: role.name })}
                                </option>
                            ))}
                        </select>

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="border-ds-border text-ds-text3 hover:text-ds-text flex items-center gap-1 rounded-lg border px-3 py-2 text-[13px] transition"
                            >
                                <X size={13} />
                                {t('users.index.search.clear')}
                            </button>
                        )}
                    </div>

                    {/* Empty state — no users exist at all */}
                    {users.data.length === 0 && !hasActiveFilters && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Users className="text-ds-text2 h-8 w-8" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('users.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('users.index.empty.description')}</p>
                            {can('users.create') && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                                >
                                    <Plus size={14} />
                                    {t('users.index.actions.create')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Empty state — filters returned no results */}
                    {users.data.length === 0 && hasActiveFilters && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-16 text-center">
                            <Search size={28} className="text-ds-text3 mb-3" />
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('users.index.search.no_results')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('users.index.search.no_results_hint')}</p>
                            <button onClick={clearFilters} className="text-ds-accent mt-4 text-[13px] font-medium hover:underline">
                                {t('users.index.search.clear')}
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    {users.data.length > 0 && (
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
                                        {users.data.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className={`border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0 ${
                                                    !user.is_active ? 'opacity-50' : ''
                                                }`}
                                            >
                                                {/* User */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar name={user.full_name ?? user.name} index={index} />
                                                        <div className="min-w-0">
                                                            <p className="font-heading text-ds-text flex items-center gap-2 truncate font-semibold">
                                                                {user.full_name ?? user.name}
                                                                {!user.is_active && (
                                                                    <span className="bg-ds-red/10 text-ds-red rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                                                                        {t('users.index.table.inactive')}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-ds-text3 truncate text-[11px]">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Roles */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.length === 0 ? (
                                                            <span className="text-ds-text3 text-xs">{t('users.index.table.no_roles')}</span>
                                                        ) : (
                                                            user.roles.map((r) => (
                                                                <span
                                                                    key={r}
                                                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ROLE_COLORS[r] ?? ROLE_COLORS.viewer}`}
                                                                >
                                                                    {t(`users.roles.${r}`, { fallback: r })}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Last login */}
                                                <td className="text-ds-text3 px-4 py-3.5 text-[12px]">{formatDate(user.last_login_at)}</td>

                                                {/* Joined */}
                                                <td className="text-ds-text3 px-4 py-3.5 text-[12px]">{formatDate(user.created_at)}</td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {can('users.edit') && (
                                                            <button
                                                                onClick={() => setEditingUser(user)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('users.index.table.actions.edit')}
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                        )}

                                                        {can('users.edit') && user.id !== auth.user.id && (
                                                            <button
                                                                onClick={() => toggleUserStatus(user)}
                                                                className={`border-ds-border flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                                                                    user.is_active
                                                                        ? 'text-ds-text3 hover:border-ds-red/40 hover:text-ds-red'
                                                                        : 'text-ds-text3 hover:border-emerald-400/40 hover:text-emerald-500'
                                                                }`}
                                                                title={
                                                                    user.is_active
                                                                        ? t('users.index.table.actions.deactivate')
                                                                        : t('users.index.table.actions.activate')
                                                                }
                                                            >
                                                                {user.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                                                            </button>
                                                        )}

                                                        {can('users.delete') && user.id !== auth.user.id && (
                                                            <button
                                                                onClick={() => deleteUser(user)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('users.index.table.actions.delete')}
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="border-ds-border flex items-center justify-between border-t px-4 py-3">
                                    <p className="text-ds-text3 text-[13px]">
                                        {t('users.index.pagination.summary', {
                                            current: users.current_page,
                                            last: users.last_page,
                                            total: users.total,
                                        })}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {users.links.map((link, i) => (
                                            <button
                                                key={i}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-[12px] transition ${
                                                    link.active
                                                        ? 'border-ds-accent bg-ds-accent text-white'
                                                        : 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text disabled:cursor-not-allowed disabled:opacity-40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {editingUser && <EditRolesModal user={editingUser} roles={roles} onClose={() => setEditingUser(null)} />}
                {showCreate && <CreateUserModal roles={roles} onClose={() => setShowCreate(false)} />}
            </AppLayout>
        </>
    );
}
