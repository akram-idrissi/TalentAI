import { useI18n } from '@/hooks/useI18n';
import { router } from '@inertiajs/react';
import { CheckSquare, Square, X } from 'lucide-react';
import { useState } from 'react';

export function CreateRoleModal({ allPermissions, onClose }: { allPermissions: Record<string, string[]>; onClose: () => void }) {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [nameError, setNameError] = useState('');

    const togglePerm = (perm: string) => setSelectedPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));

    const toggleModule = (perms: string[]) => {
        const allSelected = perms.every((p) => selectedPerms.includes(p));
        setSelectedPerms((prev) => (allSelected ? prev.filter((p) => !perms.includes(p)) : [...new Set([...prev, ...perms])]));
    };

    const save = () => {
        if (!name.trim()) {
            setNameError(t('roles.create_modal.fields.name'));
            return;
        }
        setSaving(true);
        router.post(
            route('dashboard.roles.store'),
            { name: name.trim(), permissions: selectedPerms },
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
            <div className="border-ds-border bg-ds-surface flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl">
                {/* Header */}
                <div className="border-ds-border flex shrink-0 items-center justify-between border-b px-6 py-4">
                    <h2 className="font-heading text-ds-text font-semibold">{t('roles.create_modal.title')}</h2>
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text3 hover:bg-ds-bg3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Name field */}
                    <div className="mb-5">
                        <label className="text-ds-text mb-1.5 block text-[13px] font-medium">{t('roles.create_modal.fields.name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError('');
                            }}
                            placeholder={t('roles.create_modal.fields.name_placeholder')}
                            className={`border-ds-border bg-ds-bg text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/30 w-full rounded-lg border px-3 py-2 text-[13px] transition outline-none focus:ring-1 ${nameError ? 'border-ds-red' : ''}`}
                        />
                        {nameError && <p className="text-ds-red mt-1 text-[11px]">{nameError}</p>}
                    </div>

                    {/* Permission matrix */}
                    <div className="space-y-5">
                        {Object.entries(allPermissions).map(([module, perms]) => {
                            const allSelected = perms.every((p) => selectedPerms.includes(p));
                            return (
                                <div key={module}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-ds-text3 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                            {t(`roles.modules.${module}`, { fallback: module })}
                                        </p>
                                        <button
                                            onClick={() => toggleModule(perms)}
                                            className="text-ds-text3 hover:text-ds-accent flex items-center gap-1 text-[11px] transition"
                                        >
                                            {allSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                                        </button>
                                    </div>
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
                                                    <input type="checkbox" checked={checked} onChange={() => togglePerm(perm)} className="hidden" />
                                                    {t(`roles.actions.${action}`, { fallback: action })}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-ds-border flex shrink-0 justify-end gap-3 border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text rounded-lg border px-4 py-2 text-[13px] transition"
                    >
                        {t('roles.create_modal.actions.cancel')}
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="bg-ds-accent rounded-lg px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                    >
                        {saving ? t('roles.create_modal.actions.submitting') : t('roles.create_modal.actions.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
