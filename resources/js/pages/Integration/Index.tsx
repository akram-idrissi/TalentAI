import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { Integration, IntegrationsProps } from '@/types/integration';
import { Head } from '@inertiajs/react';
import { Brain, Calendar, Search } from 'lucide-react';
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

    const completionPercentage = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;

    const progressValue = totalCount > 0 ? (connectedCount / totalCount) * 88 : 0;

    const categoryIcons = {
        sourcing: Search,
        ai: Brain,
        scheduling: Calendar,
    } as const;

    return (
        <>
            <Head title={t('integrations.page.title')} />

            <AppLayout>
                <div className="bg-ds-bg min-h-full px-4 py-6 sm:px-6 sm:py-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <h1 className="font-heading text-ds-text text-[28px] font-bold">{t('integrations.page.title')}</h1>

                                <p className="text-ds-text2 mt-1 max-w-2xl text-[14px]">{t('integrations.page.subtitle')}</p>
                            </div>

                            <div className="border-ds-border bg-ds-surface min-w-[200px] rounded-2xl border px-5 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex h-12 w-12 items-center justify-center">
                                        <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                                            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--ds-border)" strokeWidth="3" />

                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="14"
                                                fill="none"
                                                stroke="var(--ds-accent)"
                                                strokeWidth="3"
                                                strokeDasharray={`${progressValue} 88`}
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        <span className="text-ds-text absolute text-[10px] font-semibold">{completionPercentage}%</span>
                                    </div>

                                    <div>
                                        <p className="text-ds-text3 text-[11px] tracking-wide uppercase">{t('integrations.counter.connected')}</p>

                                        <p className="font-heading text-ds-text text-[22px] font-bold">
                                            {connectedCount}/{totalCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        {Object.keys(byCategory).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(byCategory).map(([category, items]) => {
                                    const connectedInCategory = items.filter((i) => i.has_token).length;

                                    const Icon = categoryIcons[category as keyof typeof categoryIcons];

                                    return (
                                        <section key={category} className="border-ds-border bg-ds-surface rounded-2xl border p-5">
                                            <div className="mb-5 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {Icon && <Icon size={14} className="text-ds-text3" />}

                                                        <p className="text-ds-text text-sm font-semibold">{categoryLabels[category] ?? category}</p>
                                                    </div>

                                                    <p className="text-ds-text3 mt-0.5 text-xs">
                                                        {t('integrations.category_count', {
                                                            count: items.length,
                                                        })}
                                                    </p>
                                                </div>

                                                <span className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-full border px-3 py-1 text-xs font-medium">
                                                    {connectedInCategory}/{items.length} {t('integrations.counter.connected')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                                {items.map((integration) => (
                                                    <IntegrationCard key={integration.provider} integration={integration} />
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="border-ds-border bg-ds-surface rounded-2xl border py-16 text-center">
                                <p className="text-ds-text font-medium">{t('integrations.empty.title')}</p>

                                <p className="text-ds-text3 mt-1 text-sm">{t('integrations.empty.description')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
