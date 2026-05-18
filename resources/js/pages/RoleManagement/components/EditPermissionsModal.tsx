import { useI18n } from '@/hooks/useI18n';
import { Role } from '@/types/roles';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { ROLE_COLORS } from '../constants';

export function EditPermissionsModal({
    role,
    allPermissions,
    onClose,
}: {
    role: Role;
    allPermissions: Record<string, string[]>;
    onClose: () => void;
}) {
    const { t } = useI18n();
    const [selectedPerms, setSelectedPerms] = useState<string[]>([...role.permissions]);
    const [saving, setSaving] = useState(false);

    const togglePerm = (perm: string) => setSelectedPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));

    const save = () => {
        setSaving(true);
        router.put(
            route('dashboard.roles.update', role.id),
            { permissions: selectedPerms },
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
            <div className="border-ds-border bg-ds-surface w-full max-w-2xl rounded-2xl border shadow-2xl">
                {/* Header */}
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="font-heading text-ds-text font-semibold">
                            {t('roles.edit_modal.title')} —{' '}
                            <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${ROLE_COLORS[role.name] ?? ''}`}>
                                {t(`roles.roles.${role.name}`, { fallback: role.name })}
                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text3 hover:bg-ds-bg3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Permission matrix */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                    <div className="space-y-5">
                        {Object.entries(allPermissions).map(([module, perms]) => (
                            <div key={module}>
                                <p className="text-ds-text3 mb-2 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                    {t(`roles.modules.${module}`, { fallback: module })}
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

                {/* Footer */}
                <div className="border-ds-border flex justify-end gap-3 border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text rounded-lg border px-4 py-2 text-[13px] transition"
                    >
                        {t('roles.edit_modal.actions.cancel')}
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="bg-ds-accent rounded-lg px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                    >
                        {saving ? t('roles.edit_modal.actions.submitting') : t('roles.edit_modal.actions.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
