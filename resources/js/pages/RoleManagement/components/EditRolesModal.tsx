import { useI18n } from '@/hooks/useI18n';
import { Role, User } from '@/types/users';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ROLE_COLORS } from '../constants';

export function EditRolesModal({ user, roles, onClose }: { user: User; roles: Role[]; onClose: () => void }) {
    const { t } = useI18n();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([...user.roles]);
    const [saving, setSaving] = useState(false);

    const toggleRole = (r: string) => setSelectedRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

    const save = () => {
        setSaving(true);
        router.put(
            route('dashboard.users.update-role', user.id),
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
