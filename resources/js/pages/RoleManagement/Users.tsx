import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Edit2, Plus, Shield, Trash2, UserCheck, UserX, X } from 'lucide-react';
import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type User = {
    id: number;
    name: string;
    full_name: string | null;
    email: string;
    roles: string[];
    last_login_at: string | null;
    created_at: string;
    is_active: boolean;
};

type Role = { id: number; name: string };

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type PageProps = {
    users: Paginated<User>;
    roles: Role[];
    flash: { success?: string; error?: string };
    auth: { user: { id: number } };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    recruiter: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    hiring_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const AVATAR_COLORS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#34D399] to-[#38BDF8]',
    'from-[#FBBF24] to-[#F87171]',
    'from-[#A78BFA] to-[#6C63FF]',
    'from-[#F87171] to-[#FBBF24]',
];

function UserAvatar({ name, index }: { name: string; index: number }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-[11px] font-bold text-white`}
        >
            {initials}
        </div>
    );
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Flash message ─────────────────────────────────────────────────────────────

function FlashMessage({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div
            className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${
                isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200'
            }`}
            role="alert"
        >
            <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isSuccess
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                }`}
            >
                <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{message}</p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                aria-label="Dismiss"
            >
                <X size={15} />
            </button>
        </div>
    );
}

// ── Create user modal ─────────────────────────────────────────────────────────

function CreateUserModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
    const { t } = useI18n();
    const [form, setForm] = useState({ name: '', email: '', password: '', roles: ['viewer'] });
    const [saving, setSaving] = useState(false);

    const submit = () => {
        setSaving(true);
        router.post(route('roles.users.create'), form, {
            preserveScroll: true,
            onFinish: () => {
                setSaving(false);
                onClose();
            },
        });
    };

    const toggleRole = (r: string) =>
        setForm((prev) => ({
            ...prev,
            roles: prev.roles.includes(r) ? prev.roles.filter((x) => x !== r) : [...prev.roles, r],
        }));

    const fields = ['name', 'email', 'password'] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="border-ds-border bg-ds-surface w-full max-w-md rounded-2xl border shadow-2xl">
                {/* Header */}
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <h2 className="font-heading text-ds-text font-semibold">{t('users.create_modal.title')}</h2>
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text3 hover:bg-ds-bg3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    {fields.map((field) => (
                        <div key={field} className="grid gap-1.5">
                            <label className="text-ds-text3 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                {t(`users.create_modal.fields.${field}`)}
                            </label>
                            <input
                                type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                                value={form[field]}
                                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                                className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border px-3 py-2.5 text-[13px] focus:ring-1 focus:outline-none"
                            />
                        </div>
                    ))}

                    <div className="grid gap-1.5">
                        <label className="text-ds-text3 text-[10px] font-semibold tracking-[0.8px] uppercase">
                            {t('users.create_modal.fields.roles')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((r) => (
                                <label
                                    key={r.name}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                                        form.roles.includes(r.name)
                                            ? 'border-ds-accent/40 bg-ds-accent/10 text-ds-accent'
                                            : 'border-ds-border bg-ds-bg3 text-ds-text2 hover:border-ds-border2 hover:text-ds-text'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.roles.includes(r.name)}
                                        onChange={() => toggleRole(r.name)}
                                        className="h-3.5 w-3.5"
                                    />
                                    {t(`users.roles.${r.name}`, { fallback: r.name })}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-ds-border flex justify-end gap-3 border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text rounded-lg border px-4 py-2 text-[13px] transition"
                    >
                        {t('users.create_modal.actions.cancel')}
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving || !form.name || !form.email || !form.password}
                        className="bg-ds-accent rounded-lg px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                    >
                        {saving ? t('users.create_modal.actions.submitting') : t('users.create_modal.actions.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Edit roles modal ──────────────────────────────────────────────────────────

function EditRolesModal({ user, roles, onClose }: { user: User; roles: Role[]; onClose: () => void }) {
    const { t } = useI18n();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([...user.roles]);
    const [saving, setSaving] = useState(false);

    const toggleRole = (r: string) => setSelectedRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

    const save = () => {
        setSaving(true);
        router.put(
            route('roles.users.update-role', user.id),
            { roles: selectedRoles },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSaving(false);
                    onClose();
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="border-ds-border bg-ds-surface w-full max-w-sm rounded-2xl border shadow-2xl">
                {/* Header */}
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="font-heading text-ds-text font-semibold">{t('users.edit_modal.title')}</h2>
                        <p className="text-ds-text3 text-[12px]">{user.full_name ?? user.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text3 hover:bg-ds-bg3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-2 px-6 py-4">
                    {roles.map((r) => (
                        <label
                            key={r.name}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors ${
                                selectedRoles.includes(r.name) ? 'border-ds-accent/40 bg-ds-accent/10' : 'border-ds-border hover:bg-ds-bg3'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedRoles.includes(r.name)}
                                onChange={() => toggleRole(r.name)}
                                className="h-4 w-4 rounded"
                            />
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[r.name] ?? ROLE_COLORS.viewer}`}>
                                {t(`users.roles.${r.name}`, { fallback: r.name })}
                            </span>
                        </label>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-ds-border flex justify-end gap-3 border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text rounded-lg border px-4 py-2 text-[13px] transition"
                    >
                        {t('users.edit_modal.actions.cancel')}
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || selectedRoles.length === 0}
                        className="bg-ds-accent rounded-lg px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                    >
                        {saving ? t('users.edit_modal.actions.submitting') : t('users.edit_modal.actions.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

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
