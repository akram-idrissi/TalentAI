import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { EditRolePageProps } from '@/types/roles';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckSquare, Save, Square } from 'lucide-react';
import { useState } from 'react';
import { ROLE_COLORS } from './constants';

export default function EditRole() {
    const { role, allPermissions } = usePage<EditRolePageProps>().props;
    const { t } = useI18n();

    const [selectedPerms, setSelectedPerms] = useState<string[]>([...(role.permissions as string[])]);
    const [saving, setSaving] = useState(false);
    const togglePerm = (perm: string) => setSelectedPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));

    const toggleModule = (perms: string[]) => {
        const allSelected = perms.every((p) => selectedPerms.includes(p));
        setSelectedPerms((prev) => (allSelected ? prev.filter((p) => !perms.includes(p)) : [...new Set([...prev, ...perms])]));
    };

    const save = () => {
        setSaving(true);
        router.put(
            route('dashboard.roles.update', role.id),
            { permissions: selectedPerms },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const totalPerms = Object.values(allPermissions).flat().length;
    const selectedCount = selectedPerms.length;

    return (
        <>
            <Head title={t('roles.edit_modal.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <a
                                href={route('dashboard.roles.index')}
                                className="border-ds-border text-ds-text3 hover:bg-ds-surface hover:text-ds-text mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition"
                            >
                                <ArrowLeft size={15} />
                            </a>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-heading text-ds-text text-[22px] font-bold">{t('roles.edit_modal.title')}</h1>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${ROLE_COLORS[role.name] ?? ROLE_COLORS.viewer}`}
                                    >
                                        {t(`roles.roles.${role.name}`, { fallback: role.name })}
                                    </span>
                                </div>
                                <p className="text-ds-text3 mt-1 text-[13px]">
                                    {selectedCount} / {totalPerms} {t('roles.index.table.permissions').toLowerCase()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={save}
                            disabled={saving}
                            className="bg-ds-accent flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                        >
                            <Save size={14} />
                            {saving ? t('roles.edit_modal.actions.submitting') : t('roles.edit_modal.actions.submit')}
                        </button>
                    </div>

                    {/* Permission matrix */}
                    <div className="border-ds-border bg-ds-surface overflow-hidden rounded-2xl border">
                        <div className="divide-ds-border divide-y">
                            {Object.entries(allPermissions).map(([module, perms]) => {
                                const allSelected = perms.every((p) => selectedPerms.includes(p));
                                const someSelected = perms.some((p) => selectedPerms.includes(p));

                                return (
                                    <div key={module} className="px-6 py-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <p className="text-ds-text text-[13px] font-semibold">
                                                    {t(`roles.modules.${module}`, { fallback: module })}
                                                </p>
                                                {someSelected && !allSelected && (
                                                    <span className="bg-ds-accent/10 text-ds-accent rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                        {perms.filter((p) => selectedPerms.includes(p)).length}/{perms.length}
                                                    </span>
                                                )}
                                                {allSelected && (
                                                    <span className="bg-ds-accent/10 text-ds-accent rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                        {t('roles.index.table.all_permissions')}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => toggleModule(perms)}
                                                className="text-ds-text3 hover:text-ds-accent flex items-center gap-1.5 text-[12px] transition"
                                            >
                                                {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                                                {allSelected ? 'Tout retirer' : 'Tout sélectionner'}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {perms.map((perm) => {
                                                const action = perm.split('.')[1];
                                                const checked = selectedPerms.includes(perm);
                                                return (
                                                    <label
                                                        key={perm}
                                                        className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2 text-[13px] transition-all ${
                                                            checked
                                                                ? 'border-ds-accent/40 bg-ds-accent/10 text-ds-accent font-medium'
                                                                : 'border-ds-border bg-ds-bg text-ds-text2 hover:border-ds-border2 hover:text-ds-text'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => togglePerm(perm)}
                                                            className="hidden"
                                                        />
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

                    {/* Footer save */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={save}
                            disabled={saving}
                            className="bg-ds-accent flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                        >
                            <Save size={14} />
                            {saving ? t('roles.edit_modal.actions.submitting') : t('roles.edit_modal.actions.submit')}
                        </button>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
