import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types/roles';
import { Head, usePage } from '@inertiajs/react';
import { Edit2, Plus, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { CreateRoleModal } from './components/CreateRoleModal';
import { RoleUsersModal } from './components/RoleUsersModal';
import { ROLE_COLORS } from './constants';

function formatPermission(perm: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
    const [module, action] = perm.split('.');
    const moduleName = t(`roles.modules.${module}`, { fallback: module });
    const actionName = t(`roles.actions.${action}`, { fallback: action });
    return `${moduleName} · ${actionName}`;
}

export default function RolesIndex() {
    const { roles, allPermissions } = usePage<PageProps>().props;
    const { t } = useI18n();
    const { can } = usePermission();

    const [viewingRoleId, setViewingRoleId] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const viewingRole = viewingRoleId !== null ? (roles.find((r) => r.id === viewingRoleId) ?? null) : null;

    const TABLE_COLS = [t('roles.index.table.role'), t('roles.index.table.users'), t('roles.index.table.permissions'), ''];

    return (
        <>
            <Head title={t('roles.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('roles.index.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('roles.index.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={route('dashboard.users.index')}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition"
                            >
                                <Users size={14} />
                                {t('roles.index.nav.users')}
                            </a>
                            {can('roles.manage') && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                                >
                                    <Plus size={14} />
                                    {t('roles.create_modal.actions.submit')}
                                </button>
                            )}
                        </div>
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
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-ds-accent/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                                                            <Shield size={15} className="text-ds-accent" />
                                                        </div>
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role.name] ?? ROLE_COLORS.viewer}`}
                                                        >
                                                            {t(`roles.roles.${role.name}`, { fallback: role.name })}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* User count — clickable */}
                                                <td className="px-4 py-4 align-top">
                                                    <button
                                                        onClick={() => setViewingRoleId(role.id)}
                                                        className="text-ds-accent text-[13px] font-medium hover:underline"
                                                    >
                                                        {userCount}
                                                    </button>
                                                </td>

                                                {/* Permission pills */}
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.name === 'super_admin' ? (
                                                            <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                                {t('roles.index.table.all_permissions')}
                                                            </span>
                                                        ) : role.permissions.length === 0 ? (
                                                            <span className="text-ds-text3 text-xs">{t('roles.index.table.no_permissions')}</span>
                                                        ) : (
                                                            <>
                                                                {(role.permissions as string[]).slice(0, 4).map((perm) => (
                                                                    <span
                                                                        key={perm}
                                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-full border px-2 py-0.5 text-[11px]"
                                                                    >
                                                                        {formatPermission(perm, t)}
                                                                    </span>
                                                                ))}
                                                                {role.permissions.length > 4 && (
                                                                    <span className="border-ds-border bg-ds-bg3 text-ds-text3 rounded-full border px-2 py-0.5 text-[11px]">
                                                                        {t('roles.index.table.more', {
                                                                            count: role.permissions.length - 4,
                                                                        })}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {can('roles.manage') && role.name !== 'super_admin' && (
                                                            <a
                                                                href={route('dashboard.roles.edit', role.id)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('roles.index.table.actions.edit')}
                                                            >
                                                                <Edit2 size={13} />
                                                            </a>
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

                {/* Modals */}
                {viewingRole && <RoleUsersModal role={viewingRole} onClose={() => setViewingRoleId(null)} />}
                {showCreate && <CreateRoleModal allPermissions={allPermissions} onClose={() => setShowCreate(false)} />}
            </AppLayout>
        </>
    );
}
