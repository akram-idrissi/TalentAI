import { useI18n } from '@/hooks/useI18n';
import { GroupFormData, GroupFormModalProps } from '@/types/parameters';
import { slugify } from '@/utils/parameters';
import { useForm } from '@inertiajs/react';
import { Shield, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

const inputCls = (err?: string, disabled?: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-[13px] bg-ds-bg3 text-ds-text placeholder:text-ds-text3 outline-none transition focus:ring-1 ${
        disabled
            ? 'opacity-50 cursor-not-allowed'
            : err
              ? 'border-ds-red focus:border-ds-red focus:ring-ds-red/20'
              : 'border-ds-border focus:border-ds-accent focus:ring-ds-accent/20'
    }`;

export default function GroupFormModal({ group, onClose }: GroupFormModalProps) {
    const { t } = useI18n();
    const isEdit = !!group;
    const overlayRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm<GroupFormData>({
        key: group?.key ?? '',
        label: group?.label ?? '',
        description: group?.description ?? '',
        is_active: group?.is_active ?? true,
    });

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    function handleLabelChange(val: string) {
        setData((prev) => ({
            ...prev,
            label: val,
            key: !isEdit && (prev.key === '' || prev.key === slugify(prev.label)) ? slugify(val) : prev.key,
        }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (isEdit) {
            put(route('dashboard.parameters.update', group!.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('dashboard.parameters.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    }

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === overlayRef.current) onClose();
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        >
            <div className="bg-ds-surface border-ds-border w-full max-w-md rounded-2xl border shadow-2xl">
                {/* ── Header ── */}
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <h2 className="font-heading text-ds-text text-[16px] font-bold">
                            {isEdit ? t('parameters.edit.title') : t('parameters.create.title')}
                        </h2>
                        {isEdit && group!.is_system && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                                <Shield size={9} />
                                {t('parameters.index.system_badge')}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                    >
                        <X size={13} />
                    </button>
                </div>

                {/* ── Form ── */}
                <form onSubmit={submit} noValidate>
                    <div className="space-y-5 px-6 py-5">
                        {/* Label */}
                        <div>
                            <label className="text-ds-text2 mb-1.5 block text-[12px] font-medium">
                                {t('parameters.fields.label')} <span className="text-ds-red">*</span>
                            </label>
                            <input
                                autoFocus
                                className={inputCls(errors.label)}
                                placeholder={t('parameters.fields.label_placeholder')}
                                value={data.label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                maxLength={255}
                            />
                            {errors.label && <p className="text-ds-red mt-1 text-[11px]">{errors.label}</p>}
                        </div>

                        {/* Key */}
                        <div>
                            <label className="text-ds-text2 mb-1.5 block text-[12px] font-medium">
                                {t('parameters.fields.key')} <span className="text-ds-red">*</span>
                            </label>
                            <input
                                className={inputCls(errors.key, isEdit && group!.is_system)}
                                placeholder={t('parameters.fields.key_placeholder')}
                                value={data.key}
                                onChange={(e) => setData('key', e.target.value)}
                                maxLength={100}
                                disabled={isEdit && group!.is_system}
                            />
                            {errors.key ? (
                                <p className="text-ds-red mt-1 text-[11px]">{errors.key}</p>
                            ) : (
                                <p className="text-ds-text3 mt-1 text-[11px]">
                                    {isEdit && group!.is_system
                                        ? t('parameters.fields.key_system_hint')
                                        : isEdit
                                          ? t('parameters.fields.key_edit_hint')
                                          : t('parameters.fields.key_hint')}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-ds-text2 mb-1.5 block text-[12px] font-medium">{t('parameters.fields.description')}</label>
                            <textarea
                                className={inputCls(errors.description)}
                                placeholder={t('parameters.fields.description_placeholder')}
                                value={data.description}
                                rows={3}
                                maxLength={500}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-ds-red mt-1 text-[11px]">{errors.description}</p>}
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-ds-text text-[13px] font-medium">{t('parameters.fields.active')}</p>
                                <p className="text-ds-text3 text-[11px]">{t('parameters.fields.active_hint')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('is_active', !data.is_active)}
                                className={`relative h-5 w-9 rounded-full transition-colors ${data.is_active ? 'bg-ds-accent' : 'bg-ds-border'}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                        data.is_active ? 'translate-x-4' : ''
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* ── Footer actions ── */}
                    <div className="border-ds-border flex gap-3 border-t px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-ds-border text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text flex-1 rounded-lg border py-2.5 text-center text-[13px] font-medium transition"
                        >
                            {t('parameters.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-ds-accent flex-1 rounded-lg py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isEdit
                                ? processing
                                    ? t('parameters.actions.saving')
                                    : `${t('parameters.actions.save')}`
                                : processing
                                  ? t('parameters.actions.creating')
                                  : `${t('parameters.actions.create')}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
