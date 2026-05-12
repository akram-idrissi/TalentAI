import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { PageProps, User } from '@/types/users';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit2, Plus, Shield, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
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
    const { users, roles, flash, auth } = usePage<PageProps>().props;
    const { t } = useI18n();
    const { can } = usePermission();

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [visibleFlash, setVisibleFlash] = useState({
        success: Boolean(flash.success),
        error: Boolean(flash.error),
    });
    const toggleUserStatus = (user: User) => {
        const routeName = user.is_active ? 'roles.users.deactivate' : 'roles.users.activate';

        router.patch(route(routeName, user.id), {}, { preserveScroll: true });
    };
    const deleteUser = (user: User) => {
        if (!confirm(t('users.index.delete_confirm', { name: user.full_name ?? user.name }))) return;
        router.delete(route('roles.users.delete', user.id), { preserveScroll: true });
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
                                href={route('roles.index')}
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

                    {/* Empty state */}
                    {users.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <span className="text-2xl">👤</span>
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
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                {/* User */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar name={user.full_name ?? user.name} index={index} />
                                                        <div className="min-w-0">
                                                            <p className="font-heading text-ds-text truncate font-semibold">
                                                                {user.full_name ?? user.name}
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
