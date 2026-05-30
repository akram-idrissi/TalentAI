import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { ParameterValue, ShowParametersProps } from '@/types/parameters';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Edit2, GripVertical, Hash, Plus, Shield, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddValueRow } from './components/AddValueRow';
import { EditValueRow } from './components/EditValueRow';
import GroupFormModal from './components/GroupFormModal';

export default function Show({ group, values }: ShowParametersProps) {
    const { t } = useI18n();
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingValue, setDeletingValue] = useState<ParameterValue | null>(null);
    const [editingGroup, setEditingGroup] = useState(false);

    function handleDelete() {
        if (!deletingValue) return;
        router.delete(route('dashboard.parameters.values.destroy', { group: group.id, value: deletingValue.id }), {
            preserveScroll: true,
            onSuccess: () => setDeletingValue(null),
        });
    }

    function handleToggle(val: ParameterValue) {
        router.patch(route('dashboard.parameters.values.toggle', { group: group.id, value: val.id }), {}, { preserveScroll: true });
    }

    const isEmpty = values.length === 0 && !adding;

    return (
        <>
            <Head title={`${t('parameters.index.title')} — ${group.label}`} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* ── Header ── */}
                    <div className="mb-6 flex items-start gap-3">
                        <Link
                            href={route('dashboard.parameters.index')}
                            className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:bg-ds-accent/[0.06] hover:text-ds-accent mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition"
                            title={t('parameters.show.actions.back')}
                        >
                            <ChevronLeft size={16} />
                        </Link>

                        <div className="flex-1">
                            <p className="text-ds-text3 mb-1 text-[12px]">
                                <Link href={route('dashboard.parameters.index')} className="hover:text-ds-text2 transition">
                                    {t('parameters.index.title')}
                                </Link>{' '}
                                <span className="text-ds-text2">› {group.label}</span>
                            </p>

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{group.label}</h1>
                                        {group.is_system && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                                                <Shield size={10} />
                                                {t('parameters.index.system_badge')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-ds-text2 mt-1 flex items-center gap-2 text-[13px]">
                                        <span className="text-ds-text3 text-[12px]">{t('parameters.show.key_label')}</span>
                                        <code className="bg-ds-bg3 border-ds-border rounded border px-1.5 py-0.5 font-mono text-[11px]">
                                            {group.key}
                                        </code>
                                        {group.description && (
                                            <>
                                                <span className="text-ds-border">·</span>
                                                <span className="text-ds-text3 text-[13px]">{group.description}</span>
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingGroup(true)}
                                        className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] transition"
                                    >
                                        <Edit2 size={13} />
                                        {t('parameters.show.actions.edit_group')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAdding(true);
                                            setEditingId(null);
                                        }}
                                        className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                                    >
                                        <Plus size={14} />
                                        {t('parameters.show.actions.add_value')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Table / Empty state ── */}
                    <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                        {/* Empty state — rendered outside the table so it can be a flex card */}
                        {isEmpty ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                    <Hash size={22} className="text-ds-accent" />
                                </div>
                                <p className="font-heading text-ds-text text-[15px] font-semibold">{t('parameters.show.empty')}</p>
                                <p className="text-ds-text3 mt-1 max-w-[260px] text-[13px]">{t('parameters.show.empty_description')}</p>
                                <button
                                    onClick={() => setAdding(true)}
                                    className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                                >
                                    <Plus size={14} />
                                    {t('parameters.show.empty_cta')}
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border border-b">
                                            <th className="text-ds-text3 w-8 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase" />
                                            {[
                                                t('parameters.show.columns.value'),
                                                t('parameters.show.columns.label'),
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
                                        {adding && <AddValueRow groupId={group.id} onDone={() => setAdding(false)} />}

                                        {values.map((val) =>
                                            editingId === val.id ? (
                                                <EditValueRow key={val.id} value={val} groupId={group.id} onDone={() => setEditingId(null)} />
                                            ) : (
                                                <tr
                                                    key={val.id}
                                                    className={`border-ds-border border-b transition-colors last:border-0 ${
                                                        val.is_active ? 'hover:bg-ds-bg3/40' : 'bg-ds-bg3/20'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3.5 text-center">
                                                        <GripVertical
                                                            size={13}
                                                            className="text-ds-text3/50 hover:text-ds-text3 cursor-grab transition-colors"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <code
                                                            className={`bg-ds-bg3 border-ds-border rounded border px-2 py-0.5 font-mono text-[11px] transition-opacity ${
                                                                !val.is_active ? 'opacity-40' : 'text-ds-text2'
                                                            }`}
                                                        >
                                                            {val.value}
                                                        </code>
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3.5 font-medium transition-opacity ${!val.is_active ? 'text-ds-text3 opacity-60' : 'text-ds-text'}`}
                                                    >
                                                        {val.label}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        {val.is_active ? (
                                                            <span className="bg-badge-active-bg text-badge-active-text border-badge-active-text/20 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                                {t('parameters.status.active')}
                                                            </span>
                                                        ) : (
                                                            <span className="bg-ds-bg3 text-ds-text3 border-ds-border inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                                                                {t('parameters.status.inactive')}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(val.id);
                                                                    setAdding(false);
                                                                }}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('parameters.index.actions.edit')}
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggle(val)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={
                                                                    val.is_active
                                                                        ? t('parameters.index.actions.deactivate')
                                                                        : t('parameters.index.actions.activate')
                                                                }
                                                            >
                                                                {val.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingValue(val)}
                                                                className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                                title={t('parameters.index.actions.delete')}
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Modals ── */}
                {editingGroup && <GroupFormModal group={group} onClose={() => setEditingGroup(false)} />}

                {deletingValue && (
                    <DeleteModal
                        label={deletingValue.label}
                        i18nPrefix="parameters.modal"
                        onConfirm={handleDelete}
                        onCancel={() => setDeletingValue(null)}
                    />
                )}
            </AppLayout>
        </>
    );
}
