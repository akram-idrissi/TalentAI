import { SHOW_SOURCING_CAMPAIGN_STATUS_CONFIG } from '@/constants/sourcing_campaigns';

export function ShowSourcingCampaignStatusBadge({ status, label }: { status: string; label: string }) {
    const cfg = SHOW_SOURCING_CAMPAIGN_STATUS_CONFIG[status] ?? SHOW_SOURCING_CAMPAIGN_STATUS_CONFIG.pending;
    const isRunning = status === 'running';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${isRunning ? 'animate-pulse' : ''}`} />
            {label}
        </span>
    );
}
