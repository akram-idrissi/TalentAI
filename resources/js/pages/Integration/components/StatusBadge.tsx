import { useI18n } from '@/hooks/useI18n';
import type { Integration } from '@/types/integration';

export default function StatusBadge({ integration }: { integration: Integration }) {
    const { t } = useI18n();

    if (integration.has_token) {
        return (
            <span className="border-badge-active-text/20 bg-badge-active-bg text-badge-active-text inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                <span className="bg-ds-green h-1.5 w-1.5 rounded-full" />
                {t('integrations.status.connected')}
            </span>
        );
    }
    if (integration.has_env_fallback) {
        return (
            <span className="border-badge-sourcing-text/20 bg-badge-sourcing-bg text-badge-sourcing-text inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                <span className="bg-ds-amber h-1.5 w-1.5 rounded-full" />
                {t('integrations.status.env_fallback')}
            </span>
        );
    }
    return (
        <span className="border-ds-border bg-ds-bg3 text-ds-text3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
            <span className="bg-ds-text3 h-1.5 w-1.5 rounded-full" />
            {t('integrations.status.not_configured')}
        </span>
    );
}
