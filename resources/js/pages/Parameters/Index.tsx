import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { ModalState } from '@/types/parameters';
import { IndexParametersProps, ParameterGroup } from '@/types/parameters';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, FolderOpen, Plus, Settings2, Shield, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import GroupFormModal from './components/GroupFormModal';

export default function Index({ groups }: IndexParametersProps) {
    const { t } = useI18n();
    const [modal, setModal] = useState<ModalState>({ type: 'none' });

    function closeModal() {
        setModal({ type: 'none' });
    }

    function handleDelete() {
        if (modal.type !== 'delete') return;
        router.delete(route('dashboard.parameters.destroy', modal.group.id), {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    }

    function handleToggle(group: ParameterGroup) {
        router.put(route('dashboard.parameters.update', group.id), { ...group, is_active: !group.is_active }, { preserveScroll: true });
    }

    return (
        <>
            <Head title={t('parameters.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('parameters.index.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('parameters.index.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setModal({ type: 'create' })}
                            className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                        >
                            <Plus size={14} />
                            {t('parameters.index.actions.create')}
                        </button>
                    </div>

                    {/* Empty state */}
                    {groups.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Settings2 size={24} className="text-ds-accent" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('parameters.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('parameters.index.empty.description')}</p>
                            <button
                                onClick={() => setModal({ type: 'create' })}
                                className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('parameters.index.actions.create')}
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    {groups.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border border-b">
                                            {[
                                                t('parameters.index.columns.group'),
                                                t('parameters.index.columns.key'),
                                                t('parameters.index.columns.values'),
                                                t('parameters.index.columns.status'),
                                                '',
                                            ].map((col) => (
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
                                        {groups.map((group) => (
                                            <tr
                                                key={group.id}
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                {/* Label */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-ds-accent/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                                                            <FolderOpen size={14} className="text-ds-accent" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-heading text-ds-text font-semibold">{group.label}</p>
                                                                {group.is_system && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                                                                        <Shield size={9} />
                                                                        {t('parameters.index.system_badge')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {group.description && (
                                                                <p className="text-ds-text3 mt-0.5 text-[11px]">{group.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Key */}
                                                <td className="px-4 py-3.5">
                                                    <code className="bg-ds-bg3 border-ds-border text-ds-text2 rounded border px-2 py-0.5 font-mono text-[11px]">
                                                        {group.key}
                                                    </code>
                                                </td>

                                                {/* Values count */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-ds-text font-medium">{group.active_values_count}</span>
                                                        <span className="text-ds-text3">
                                                            / {group.values_count} {t('parameters.index.active_suffix')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3.5">
                                                    {group.is_active ? (
                                                        <span className="bg-badge-active-bg text-badge-active-text border-badge-active-text/20 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                            {t('parameters.status.active')}
                                                        </span>
                                                    ) : (
                                                        <span className="bg-ds-bg3 text-ds-text3 border-ds-border inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                            {t('parameters.status.inactive')}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Manage values — still a dedicated page (complex) */}
                                                        <Link
                                                            href={route('dashboard.parameters.show', group.id)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('parameters.index.actions.manage')}
                                                        >
                                                            <Settings2 size={13} />
                                                        </Link>

                                                        {/* Edit → modal */}
                                                        <button
                                                            onClick={() => setModal({ type: 'edit', group })}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('parameters.index.actions.edit')}
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>

                                                        {/* Toggle active */}
                                                        <button
                                                            onClick={() => handleToggle(group)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={
                                                                group.is_active
                                                                    ? t('parameters.index.actions.deactivate')
                                                                    : t('parameters.index.actions.activate')
                                                            }
                                                        >
                                                            {group.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                                        </button>

                                                        {/* Delete (non-system only) */}
                                                        {!group.is_system && (
                                                            <button
                                                                onClick={() => setModal({ type: 'delete', group })}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('parameters.index.actions.delete')}
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
                        </div>
                    )}
                </div>

                {/* ── Modals ── */}
                {modal.type === 'create' && <GroupFormModal onClose={closeModal} />}

                {modal.type === 'edit' && <GroupFormModal group={modal.group} onClose={closeModal} />}

                {modal.type === 'delete' && (
                    <DeleteModal label={modal.group.label} i18nPrefix="parameters.modal" onConfirm={handleDelete} onCancel={closeModal} />
                )}
            </AppLayout>
        </>
    );
}
