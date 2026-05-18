import { useI18n } from '@/hooks/useI18n';
import { Role } from '@/types/users';
import { router } from '@inertiajs/react';
import { Check, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

const ROLE_PILL_COLORS: Record<string, { base: string; selected: string }> = {
    super_admin: {
        base: 'border-purple-500/20 bg-purple-500/5 text-purple-400/50',
        selected: 'border-purple-400/50 bg-purple-500/15 text-purple-300',
    },
    admin: { base: 'border-blue-500/20 bg-blue-500/5 text-blue-400/50', selected: 'border-blue-400/50 bg-blue-500/15 text-blue-300' },
    recruiter: { base: 'border-teal-500/20 bg-teal-500/5 text-teal-400/50', selected: 'border-teal-400/50 bg-teal-500/15 text-teal-300' },
    hiring_manager: { base: 'border-amber-500/20 bg-amber-500/5 text-amber-400/50', selected: 'border-amber-400/50 bg-amber-500/15 text-amber-300' },
    viewer: { base: 'border-gray-500/20 bg-gray-500/5 text-gray-400/50', selected: 'border-gray-400/40 bg-gray-500/10 text-gray-300' },
};

export function CreateUserModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
    const { t } = useI18n();
    const [form, setForm] = useState({ name: '', email: '', password: '', roles: ['viewer'] });
    const [saving, setSaving] = useState(false);

    const submit = () => {
        setSaving(true);
        router.post(route('dashboard.users.create'), form, {
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

    const fields = [
        { key: 'name' as const, type: 'text' },
        { key: 'email' as const, type: 'email' },
        { key: 'password' as const, type: 'password' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="border-ds-border bg-ds-surface w-full max-w-xl rounded-2xl border shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-ds-accent/10 flex h-9 w-9 items-center justify-center rounded-xl">
                            <UserPlus size={16} className="text-ds-accent" />
                        </div>
                        <h2 className="font-heading text-ds-text font-semibold">{t('users.create_modal.title')}</h2>
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
                <div className="px-6 py-5">
                    <div className="space-y-4">
                        {fields.map(({ key, type }) => (
                            <div key={key} className="grid gap-1.5">
                                <label className="text-ds-text3 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                    {t(`users.create_modal.fields.${key}`)}
                                </label>
                                <input
                                    type={type}
                                    value={form[key]}
                                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                                    className="border-ds-border bg-ds-bg text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-xl border px-3.5 py-2.5 text-[13px] transition focus:ring-1 focus:outline-none"
                                />
                            </div>
                        ))}

                        <div className="grid gap-2">
                            <label className="text-ds-text3 text-[10px] font-semibold tracking-[0.8px] uppercase">
                                {t('users.create_modal.fields.roles')}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map((r) => {
                                    const isSelected = form.roles.includes(r.name);
                                    const colors = ROLE_PILL_COLORS[r.name] ?? ROLE_PILL_COLORS.viewer;
                                    return (
                                        <button
                                            key={r.name}
                                            type="button"
                                            onClick={() => toggleRole(r.name)}
                                            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-all ${
                                                isSelected ? colors.selected : colors.base
                                            }`}
                                        >
                                            <span
                                                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border transition-all ${
                                                    isSelected ? 'border-current bg-current' : 'border-current/40'
                                                }`}
                                            >
                                                {isSelected && <Check size={10} className="text-ds-surface" strokeWidth={3} />}
                                            </span>
                                            <span className="truncate">{t(`users.roles.${r.name}`, { fallback: r.name })}</span>
                                        </button>
                                    );
                                })}
                            </div>
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
                        className="bg-ds-accent flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                    >
                        {saving ? t('users.create_modal.actions.submitting') : t('users.create_modal.actions.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
