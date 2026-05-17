import { useI18n } from '@/hooks/useI18n';
import { Role } from '@/types/users';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';

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
