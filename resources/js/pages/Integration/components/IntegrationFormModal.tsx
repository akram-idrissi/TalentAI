import type { Integration } from '@/types/integration';
import { useForm } from '@inertiajs/react';
import { Globe, X } from 'lucide-react';

import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { IntegrationIcon } from './IntegrationIcon';

interface IntegrationFormModalProps {
    integration?: Integration;
    onClose: () => void;
}

const CATEGORIES = ['sourcing', 'ai', 'scheduling'];

export default function IntegrationFormModal({ integration, onClose }: IntegrationFormModalProps) {
    const { t } = useI18n();
    const isEdit = !!integration;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        provider: integration?.provider ?? '',
        label: integration?.label ?? '',
        category: integration?.category ?? '',
        icon: integration?.icon ?? '',
        description: integration?.description ?? '',
        token_label: integration?.token_label ?? '',
        placeholder: integration?.placeholder ?? '',
        env_key: integration?.env_key ?? '',
        test_url: integration?.test_url ?? '',
        docs_url: integration?.docs_url ?? '',
        oauth: integration?.oauth ?? false,
        is_active: integration?.is_active ?? true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEdit) {
            put(route('dashboard.admin.integrations.update', integration.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('dashboard.admin.integrations.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="border-ds-border bg-ds-surface w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl">
                <div className="border-ds-border flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="font-heading text-ds-text text-[16px] font-bold">
                            {t(isEdit ? 'integrations.admin.modal.edit_title' : 'integrations.admin.modal.create_title')}
                        </h2>
                        <p className="text-ds-text3 mt-0.5 text-[12px]">
                            {isEdit
                                ? t('integrations.admin.modal.edit_subtitle', { label: integration.label })
                                : t('integrations.admin.modal.create_subtitle')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('integrations.admin.actions.close')}
                        className="border-ds-border text-ds-text3 hover:text-ds-text flex h-8 w-8 items-center justify-center rounded-lg border transition"
                    >
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-32 shrink-0">
                                    <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                        {t('integrations.admin.form.icon')}
                                    </label>
                                    <div className="border-ds-border bg-ds-bg3 focus-within:border-ds-accent flex items-center gap-2 rounded-lg border px-3 py-2 transition">
                                        <IntegrationIcon name={data.icon} size={16} className="text-ds-text2 shrink-0" />
                                        <input
                                            type="text"
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            placeholder="Bot"
                                            className="text-ds-text placeholder:text-ds-text3 w-full bg-transparent font-mono text-[12px] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                        {t('integrations.admin.form.provider_key')} <span className="text-ds-red">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.provider}
                                        onChange={(e) => setData('provider', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="my_provider"
                                        disabled={isEdit}
                                        className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 font-mono text-[12px] transition outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.provider && <p className="text-ds-red mt-1 text-[11px]">{errors.provider}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                    {t('integrations.admin.form.display_name')} <span className="text-ds-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    placeholder={t('integrations.admin.form.placeholders.label')}
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 text-[13px] transition outline-none"
                                />
                                {errors.label && <p className="text-ds-red mt-1 text-[11px]">{errors.label}</p>}
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                        {t('integrations.admin.form.category')} <span className="text-ds-red">*</span>
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent w-full rounded-lg border px-3 py-2 text-[13px] transition outline-none"
                                    >
                                        <option value="">{t('integrations.admin.form.choose')}</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {t(`integrations.categories.${cat}`)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-ds-red mt-1 text-[11px]">{errors.category}</p>}
                                </div>

                                <div className="flex flex-col justify-end">
                                    <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                        {t('integrations.admin.table.oauth')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setData('oauth', !data.oauth)}
                                        className={cn(
                                            'flex h-[38px] items-center gap-2 rounded-lg border px-3 text-[12px] font-semibold transition',
                                            data.oauth
                                                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                                                : 'border-ds-border bg-ds-bg3 text-ds-text3',
                                        )}
                                    >
                                        <Globe size={13} />
                                        {t(data.oauth ? 'integrations.admin.auth.oauth' : 'integrations.admin.auth.token')}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                    {t('integrations.admin.form.description')}
                                </label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={t('integrations.admin.form.placeholders.description')}
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 text-[13px] transition outline-none"
                                />
                                {errors.description && <p className="text-ds-red mt-1 text-[11px]">{errors.description}</p>}
                            </div>

                            <div className="border-ds-border border-t pt-1">
                                <p className="text-ds-text3 text-[10px] font-bold tracking-[1px] uppercase">
                                    {t('integrations.admin.form.sections.user_fields')}
                                </p>
                            </div>

                            <div>
                                <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                    {t('integrations.admin.form.token_label')} <span className="text-ds-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.token_label}
                                    onChange={(e) => setData('token_label', e.target.value)}
                                    placeholder={t('integrations.admin.form.placeholders.token_label')}
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 text-[13px] transition outline-none"
                                />
                                {errors.token_label && <p className="text-ds-red mt-1 text-[11px]">{errors.token_label}</p>}
                            </div>

                            <div>
                                <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                    {t('integrations.admin.form.placeholder')}
                                </label>
                                <input
                                    type="text"
                                    value={data.placeholder ?? ''}
                                    onChange={(e) => setData('placeholder', e.target.value)}
                                    placeholder="sk-xxxxxxxxxxxx"
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 font-mono text-[12px] transition outline-none"
                                />
                            </div>

                            <div className="border-ds-border border-t pt-1">
                                <p className="text-ds-text3 text-[10px] font-bold tracking-[1px] uppercase">
                                    {t('integrations.admin.form.sections.technical_config')}
                                </p>
                            </div>

                            <div>
                                <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                    {t('integrations.admin.form.env_key')}
                                </label>
                                <input
                                    type="text"
                                    value={data.env_key ?? ''}
                                    onChange={(e) => setData('env_key', e.target.value.toUpperCase())}
                                    placeholder="MY_PROVIDER_API_KEY"
                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 font-mono text-[12px] transition outline-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                        {t('integrations.admin.form.test_url')}
                                    </label>
                                    <input
                                        type="url"
                                        value={data.test_url ?? ''}
                                        onChange={(e) => setData('test_url', e.target.value)}
                                        placeholder="https://api.example.com/me"
                                        className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 text-[12px] transition outline-none"
                                    />
                                    {errors.test_url && <p className="text-ds-red mt-1 text-[11px]">{errors.test_url}</p>}
                                </div>

                                <div className="flex-1">
                                    <label className="text-ds-text3 mb-1.5 block text-[11px] font-semibold tracking-[0.8px] uppercase">
                                        {t('integrations.admin.form.docs_url')}
                                    </label>
                                    <input
                                        type="url"
                                        value={data.docs_url ?? ''}
                                        onChange={(e) => setData('docs_url', e.target.value)}
                                        placeholder="https://docs.example.com"
                                        className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent w-full rounded-lg border px-3 py-2 text-[12px] transition outline-none"
                                    />
                                    {errors.docs_url && <p className="text-ds-red mt-1 text-[11px]">{errors.docs_url}</p>}
                                </div>
                            </div>

                            <div className="border-ds-border flex items-center justify-between rounded-lg border px-4 py-3">
                                <div>
                                    <p className="text-ds-text text-[13px] font-semibold">{t('integrations.admin.form.active')}</p>
                                    <p className="text-ds-text3 text-[11px]">{t('integrations.admin.form.active_help')}</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={data.is_active}
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={cn(
                                        'focus:ring-ds-accent/30 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:outline-none',
                                        data.is_active ? 'bg-ds-accent' : 'bg-ds-border',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                                            data.is_active ? 'translate-x-5' : 'translate-x-0.5',
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-ds-border flex items-center justify-end gap-2 border-t px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-ds-border text-ds-text2 hover:bg-ds-bg3 rounded-lg border px-4 py-2 text-[13px] transition"
                        >
                            {t('integrations.admin.modal.delete.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-ds-accent flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing && (
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            )}
                            {t(isEdit ? 'integrations.admin.actions.save' : 'integrations.admin.actions.create_submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
