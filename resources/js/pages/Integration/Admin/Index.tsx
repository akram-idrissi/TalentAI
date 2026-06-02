import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { AdminIntegrationsProps, Integration, ModalState } from '@/types/integration';
import { Head, router } from '@inertiajs/react';
import { Edit2, Globe, Plus, Settings2, Shield, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import IntegrationFormModal from '../components/IntegrationFormModal';
import { IntegrationIcon } from '../components/IntegrationIcon';

export default function Index({ integrations }: AdminIntegrationsProps) {
    const { t } = useI18n();
    const [modal, setModal] = useState<ModalState>({ type: 'none' });

    function closeModal() {
        setModal({ type: 'none' });
    }

    function handleDelete() {
        if (modal.type !== 'delete') return;
        router.delete(route('dashboard.admin.integrations.destroy', modal.integration.id), {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    }

    function handleToggle(integration: Integration) {
        router.patch(route('dashboard.admin.integrations.toggle', integration.id), {}, { preserveScroll: true });
    }

    const byCategory = integrations.reduce<Record<string, Integration[]>>((acc, i) => {
        if (!acc[i.category]) acc[i.category] = [];
        acc[i.category].push(i);
        return acc;
    }, {});

    const activeCount = integrations.filter((i) => i.is_active).length;

    return (
        <>
            <Head title={t('integrations.admin.page.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('integrations.admin.page.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('integrations.admin.page.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Counter */}
                            <div className="border-ds-border bg-ds-surface flex items-center gap-2 rounded-xl border px-4 py-2.5">
                                <span className="font-heading text-ds-text text-[15px] font-bold">
                                    {activeCount}/{integrations.length}
                                </span>
                                <span className="text-ds-text3 text-[11px]"> {t('integrations.admin.counter.active')}</span>
                            </div>

                            <button
                                onClick={() => setModal({ type: 'create' })}
                                className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('integrations.admin.actions.create')}
                            </button>
                        </div>
                    </div>

                    {/* Empty state */}
                    {integrations.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Settings2 size={24} className="text-ds-accent" />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('integrations.admin.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('integrations.admin.empty.description')}</p>
                            <button
                                onClick={() => setModal({ type: 'create' })}
                                className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('integrations.admin.actions.create')}
                            </button>
                        </div>
                    )}

                    {/* Tables grouped by category */}
                    {Object.keys(byCategory).length > 0 && (
                        <div className="space-y-8">
                            {Object.entries(byCategory).map(([category, items]) => (
                                <section key={category}>
                                    {/* Category heading */}
                                    <div className="mb-3 flex items-center gap-3">
                                        <p className="text-ds-text3 text-[10px] font-bold tracking-[1.2px] uppercase">
                                            {t(`integrations.categories.${category}`)}
                                        </p>
                                        <div className="border-ds-border flex-1 border-t" />
                                        <span className="text-ds-text3 text-[11px]">
                                            {items.filter((i) => i.is_active).length}/{items.length}
                                        </span>
                                    </div>

                                    <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-[13px]">
                                                <thead>
                                                    <tr className="border-ds-border border-b">
                                                        {[
                                                            t('integrations.admin.table.integration'),
                                                            t('integrations.admin.table.provider'),
                                                            t('integrations.admin.table.env_key'),
                                                            t('integrations.admin.table.oauth'),
                                                            t('integrations.admin.table.status'),
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
                                                    {items.map((integration) => (
                                                        <tr
                                                            key={integration.id}
                                                            className={`border-ds-border border-b transition-colors last:border-0 ${
                                                                integration.is_active ? 'hover:bg-ds-bg3/40' : 'bg-ds-bg3/20'
                                                            }`}
                                                        >
                                                            {/* Label + icon */}
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-ds-bg3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                                                        <IntegrationIcon
                                                                            name={integration.icon}
                                                                            size={20}
                                                                            className="text-ds-text2"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p
                                                                                className={`font-heading font-semibold transition-opacity ${
                                                                                    !integration.is_active
                                                                                        ? 'text-ds-text3 opacity-60'
                                                                                        : 'text-ds-text'
                                                                                }`}
                                                                            >
                                                                                {integration.label}
                                                                            </p>
                                                                            {integration.is_system && (
                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                                                                                    <Shield size={9} />
                                                                                    {t('integrations.admin.badges.system')}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {integration.description && (
                                                                            <p className="text-ds-text3 mt-0.5 text-[11px]">
                                                                                {integration.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Provider key */}
                                                            <td className="px-4 py-3.5">
                                                                <code className="bg-ds-bg3 border-ds-border text-ds-text2 rounded border px-2 py-0.5 font-mono text-[11px]">
                                                                    {integration.provider}
                                                                </code>
                                                            </td>

                                                            {/* Env key */}
                                                            <td className="px-4 py-3.5">
                                                                {integration.env_key ? (
                                                                    <code className="bg-ds-bg3 border-ds-border text-ds-text3 rounded border px-2 py-0.5 font-mono text-[11px]">
                                                                        {integration.env_key}
                                                                    </code>
                                                                ) : (
                                                                    <span className="text-ds-text3 text-[11px]">—</span>
                                                                )}
                                                            </td>

                                                            {/* OAuth */}
                                                            <td className="px-4 py-3.5">
                                                                {integration.oauth ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                                                                        <Globe size={10} />
                                                                        {t('integrations.admin.auth.oauth')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-ds-text3 text-[11px]">
                                                                        {t('integrations.admin.auth.token')}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-4 py-3.5">
                                                                {integration.is_active ? (
                                                                    <span className="bg-badge-active-bg text-badge-active-text border-badge-active-text/20 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                                        {t('integrations.admin.status.active')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-ds-bg3 text-ds-text3 border-ds-border inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                                        {t('integrations.admin.status.inactive')}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-4 py-3.5">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {/* Edit */}
                                                                    <button
                                                                        onClick={() => setModal({ type: 'edit', integration })}
                                                                        className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                        title={t('integrations.admin.actions.edit')}
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </button>

                                                                    {/* Toggle */}
                                                                    <button
                                                                        onClick={() => handleToggle(integration)}
                                                                        className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                        title={
                                                                            integration.is_active
                                                                                ? t('integrations.admin.actions.deactivate')
                                                                                : t('integrations.admin.actions.activate')
                                                                        }
                                                                    >
                                                                        {integration.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                                                    </button>

                                                                    {/* Delete (non-system only) */}
                                                                    {!integration.is_system && (
                                                                        <button
                                                                            onClick={() => setModal({ type: 'delete', integration })}
                                                                            className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                            title={t('integrations.admin.actions.delete')}
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
                                </section>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {modal.type === 'create' && <IntegrationFormModal onClose={closeModal} />}

                {modal.type === 'edit' && <IntegrationFormModal integration={modal.integration} onClose={closeModal} />}

                {modal.type === 'delete' && (
                    <DeleteModal
                        label={modal.integration.label}
                        i18nPrefix="integrations.admin.modal.delete"
                        onConfirm={handleDelete}
                        onCancel={closeModal}
                    />
                )}
            </AppLayout>
        </>
    );
}
