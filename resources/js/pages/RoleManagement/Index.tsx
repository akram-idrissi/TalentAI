import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Role } from '@/types/roles';
import { Head, usePage } from '@inertiajs/react';
import { Edit2, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { EditPermissionsModal } from './components/EditPermissionsModal';
import { FlashMessage } from './components/FlashMessage';
import { ROLE_COLORS } from './constants';
export default function RolesIndex() {
    const { roles, allPermissions, flash } = usePage<PageProps>().props;
    const { t } = useI18n();
    const { can } = usePermission();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [visibleFlash, setVisibleFlash] = useState({
        success: Boolean(flash.success),
        error: Boolean(flash.error),
    });

    const TABLE_COLS = [t('roles.index.table.role'), t('roles.index.table.users'), t('roles.index.table.permissions'), ''];

    return (
        <>
            <Head title={t('roles.index.title')} />
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
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('roles.index.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('roles.index.subtitle')}</p>
                        </div>
                        <a
                            href={route('dashboard.users.index')}
                            className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition"
                        >
                            <Users size={14} />
                            {t('roles.index.nav.users')}
                        </a>
                    </div>

                    {/* Table */}
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
                                    {roles.map((role) => {
                                        const userCount =
                                            role.users_count === 1
                                                ? t('roles.index.table.user_count.one')
                                                : t('roles.index.table.user_count.other', { count: role.users_count });

                                        return (
                                            <tr
                                                key={role.id}
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                {/* Role name */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-ds-accent/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                                                            <Shield size={15} className="text-ds-accent" />
                                                        </div>
                                                        <div>
                                                            <span
                                                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role.name] ?? ROLE_COLORS.viewer}`}
                                                            >
                                                                {t(`roles.roles.${role.name}`, { fallback: role.name })}
                                                            </span>
                                                            {role.name === 'super_admin' && (
                                                                <p className="text-ds-text3 mt-0.5 text-[11px]">
                                                                    {t('roles.index.table.super_admin_note')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* User count */}
                                                <td className="text-ds-text2 px-4 py-3.5">{userCount}</td>

                                                {/* Permission pills */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.name === 'super_admin' ? (
                                                            <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                                {t('roles.index.table.all_permissions')}
                                                            </span>
                                                        ) : role.permissions.length === 0 ? (
                                                            <span className="text-ds-text3 text-xs">{t('roles.index.table.no_permissions')}</span>
                                                        ) : (
                                                            <>
                                                                {role.permissions.slice(0, 5).map((perm) => (
                                                                    <span
                                                                        key={perm}
                                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-full border px-2 py-0.5 text-[11px]"
                                                                    >
                                                                        {perm}
                                                                    </span>
                                                                ))}
                                                                {role.permissions.length > 5 && (
                                                                    <span className="border-ds-border bg-ds-bg3 text-ds-text3 rounded-full border px-2 py-0.5 text-[11px]">
                                                                        {t('roles.index.table.more', { count: role.permissions.length - 5 })}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {can('roles.manage') && role.name !== 'super_admin' && (
                                                            <button
                                                                onClick={() => setEditingRole(role)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('roles.index.table.actions.edit')}
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit permissions modal */}
                {editingRole && <EditPermissionsModal role={editingRole} allPermissions={allPermissions} onClose={() => setEditingRole(null)} />}
            </AppLayout>
        </>
    );
}
