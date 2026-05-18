import { ACTION_COLORS } from '@/types/activity_logs';
export function ActionBadge({ action }: { action: string }) {
    const prefix = action.split('.')[0];
    const isError = action.endsWith('.error');
    const colorClass = isError ? 'bg-ds-red/10 text-ds-red border-ds-red/20' : (ACTION_COLORS[prefix] ?? 'bg-ds-bg3 text-ds-text2 border-ds-border');

    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${colorClass}`}>{action}</span>;
}
