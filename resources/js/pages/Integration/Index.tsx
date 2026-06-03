import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { Integration, IntegrationsProps } from '@/types/integration';
import { Head } from '@inertiajs/react';
import IntegrationCard from './components/IntegrationCard';

export default function Integrations({ integrations, categoryLabels }: IntegrationsProps) {
    const { t } = useI18n();

    const allIntegrations = Object.values(integrations);
    const byCategory = allIntegrations.reduce<Record<string, Integration[]>>((acc, integration) => {
        if (!acc[integration.category]) {
            acc[integration.category] = [];
        }
        acc[integration.category].push(integration);
        return acc;
    }, {});

    const connectedCount = allIntegrations.filter((i) => i.has_token).length;
    const totalCount = allIntegrations.length;

    return (
        <>
            <Head title={t('integrations.page.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-4 py-6 sm:px-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="font-heading text-ds-text text-[22px] font-bold sm:text-[26px]">{t('integrations.page.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[13px] sm:text-[14px]">{t('integrations.page.subtitle')}</p>
                        </div>
                        <div className="border-ds-border bg-ds-surface flex items-center gap-2.5 rounded-xl border px-4 py-2.5">
                            <div className="flex h-8 w-8 items-center justify-center">
                                <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--ds-border)" strokeWidth="3" />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        stroke="var(--ds-accent)"
                                        strokeWidth="3"
                                        strokeDasharray={`${(connectedCount / totalCount) * 88} 88`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-heading text-ds-text text-[15px] leading-none font-bold">
                                    {connectedCount}/{totalCount}
                                </p>
                                <p className="text-ds-text3 mt-0.5 text-[11px]">{t('integrations.counter.connected')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-8">
                        {Object.entries(byCategory).map(([category, items]) => (
                            <section key={category}>
                                <div className="mb-3 flex items-center gap-3">
                                    <p className="text-ds-text3 text-[10px] font-bold tracking-[1.2px] uppercase">
                                        {categoryLabels[category] ?? category}
                                    </p>
                                    <div className="border-ds-border flex-1 border-t" />
                                    <span className="text-ds-text3 text-[11px]">
                                        {items.filter((i) => i.has_token).length}/{items.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
                                    {items.map((integration) => (
                                        <IntegrationCard key={integration.provider} integration={integration} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
