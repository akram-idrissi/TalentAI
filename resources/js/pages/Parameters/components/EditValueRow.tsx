import { useI18n } from '@/hooks/useI18n';
import { useForm } from '@inertiajs/react';
import { Check, X } from 'lucide-react';

import { ParameterValue } from '@/types/parameters';

const inputCls = (err?: string) =>
    `w-full rounded-lg border px-3 py-2 text-[13px] bg-ds-bg3 text-ds-text placeholder:text-ds-text3 outline-none transition focus:ring-1 ${
        err ? 'border-ds-red focus:border-ds-red focus:ring-ds-red/20' : 'border-ds-border focus:border-ds-accent focus:ring-ds-accent/20'
    }`;

export function EditValueRow({ value, groupId, onDone }: { value: ParameterValue; groupId: number; onDone: () => void }) {
    const { t } = useI18n();
    const { data, setData, put, processing, errors } = useForm({
        value: value.value,
        label: value.label,
        order: value.order,
        is_active: value.is_active,
        metadata: value.metadata ? JSON.stringify(value.metadata) : '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('dashboard.parameters.values.update', { group: groupId, value: value.id }), {
            preserveScroll: true,
            onSuccess: onDone,
        });
    }

    return (
        <tr className="border-ds-border border-l-ds-accent bg-ds-accent/[0.04] border-b border-l-2">
            <td className="w-8 px-4 py-2.5" />
            <td className="px-4 py-2.5">
                <input autoFocus className={inputCls(errors.value)} value={data.value} onChange={(e) => setData('value', e.target.value)} />
                {errors.value && <p className="text-ds-red mt-1 text-[11px]">{errors.value}</p>}
            </td>
            <td className="px-4 py-2.5">
                <input className={inputCls(errors.label)} value={data.label} onChange={(e) => setData('label', e.target.value)} />
                {errors.label && <p className="text-ds-red mt-1 text-[11px]">{errors.label}</p>}
            </td>
            <td className="px-4 py-2.5" />
            <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={submit}
                        disabled={processing}
                        className="bg-ds-accent flex h-7 w-7 items-center justify-center rounded-lg text-white transition hover:bg-[#7C74FF] disabled:opacity-50"
                        title={t('parameters.show.actions.save')}
                    >
                        <Check size={13} />
                    </button>
                    <button
                        onClick={onDone}
                        className="border-ds-border text-ds-text3 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                        title={t('parameters.show.actions.cancel')}
                    >
                        <X size={13} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
