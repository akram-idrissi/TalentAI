import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit2, Shield, Users } from 'lucide-react';
import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type Role = {
    id: number;
    name: string;
    users_count: number;
    permissions: string[];
};

type AllPermissions = Record<string, string[]>;

type PageProps = {
    roles: Role[];
    allPermissions: AllPermissions;
    flash: { success?: string; error?: string };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    recruiter: 'Recruiter',
    hiring_manager: 'Hiring Manager',
    viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    recruiter: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    hiring_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const MODULE_LABELS: Record<string, string> = {
    briefs: 'Briefs',
    sourcing: 'Sourcing',
    candidates: 'Candidates',
    interviews: 'Interviews',
    reports: 'Reports',
    integrations: 'Integrations',
    classement: 'Classement',
    users: 'Users',
    roles: 'Roles',
    settings: 'Settings',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function RolesIndex() {
    const { roles, allPermissions, flash } = usePage<PageProps>().props;
    const { can } = usePermission();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setSelectedPerms([...role.permissions]);
    };

    const closeEdit = () => {
        setEditingRole(null);
        setSelectedPerms([]);
    };

    const togglePerm = (perm: string) => setSelectedPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));

    const savePermissions = () => {
        if (!editingRole) return;
        setSaving(true);
        router.put(
            route('dashboard.roles.update', editingRole.id),
            { permissions: selectedPerms },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSaving(false);
                    closeEdit();
                },
            },
        );
    };

    return (
        <>
            <Head title="Roles" />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Flash */}
                    {flash.success && (
                        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                            {flash.error}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">Roles</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">Manage role permissions for your organisation.</p>
                        </div>
                        <a
                            href={route('roles.users.index')}
                            className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition"
                        >
                            <Users size={14} />
                            Manage users →
                        </a>
                    </div>

                    {/* Roles table */}
                    <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-[13px]">
                                <thead>
                                    <tr className="border-ds-border border-b">
                                        {['ROLE', 'USERS', 'PERMISSIONS', ''].map((col) => (
                                            <th
                                                key={col}
                                                className="text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.id} className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0">
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
                                                            {ROLE_LABELS[role.name] ?? role.name}
                                                        </span>
                                                        {role.name === 'super_admin' && (
                                                            <p className="text-ds-text3 mt-0.5 text-[11px]">Gate bypass — all permissions</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* User count */}
                                            <td className="text-ds-text2 px-4 py-3.5">
                                                {role.users_count} {role.users_count === 1 ? 'user' : 'users'}
                                            </td>

                                            {/* Permission pills */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {role.name === 'super_admin' ? (
                                                        <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                            All permissions
                                                        </span>
                                                    ) : role.permissions.length === 0 ? (
                                                        <span className="text-ds-text3 text-xs">No permissions</span>
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
                                                                    +{role.permissions.length - 5} more
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
                                                            onClick={() => openEdit(role)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title="Edit permissions"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit permissions modal */}
                {editingRole && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                        <div className="border-ds-border bg-ds-surface w-full max-w-2xl rounded-2xl border shadow-2xl">
                            {/* Modal header */}
                            <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                                <div>
                                    <h2 className="font-heading text-ds-text font-semibold">
                                        Edit permissions —{' '}
                                        <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${ROLE_COLORS[editingRole.name] ?? ''}`}>
                                            {ROLE_LABELS[editingRole.name] ?? editingRole.name}
                                        </span>
                                    </h2>
                                </div>
                                <button
                                    onClick={closeEdit}
                                    className="border-ds-border text-ds-text3 hover:bg-ds-bg3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border text-sm transition"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Permission matrix */}
                            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                                <div className="space-y-5">
                                    {Object.entries(allPermissions).map(([module, perms]) => (
                                        <div key={module}>
                                            <p className="text-ds-text3 mb-2 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                                {MODULE_LABELS[module] ?? module}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {perms.map((perm) => {
                                                    const action = perm.split('.')[1];
                                                    const checked = selectedPerms.includes(perm);
                                                    return (
                                                        <label
                                                            key={perm}
                                                            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                                                                checked
                                                                    ? 'border-ds-accent/40 bg-ds-accent/10 text-ds-accent'
                                                                    : 'border-ds-border bg-ds-bg3 text-ds-text2 hover:border-ds-border2 hover:text-ds-text'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => togglePerm(perm)}
                                                                className="h-3.5 w-3.5 rounded"
                                                            />
                                                            {action}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="border-ds-border flex justify-end gap-3 border-t px-6 py-4">
                                <button
                                    onClick={closeEdit}
                                    className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text rounded-lg border px-4 py-2 text-[13px] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={savePermissions}
                                    disabled={saving}
                                    className="bg-ds-accent rounded-lg px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                                >
                                    {saving ? 'Saving…' : 'Save permissions'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AppLayout>
        </>
    );
}
