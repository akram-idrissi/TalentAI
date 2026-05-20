import { HTTP_COLORS } from '@/types/activity_logs';
export function HttpMethodBadge({ method }: { method: string | null }) {
    if (!method) return null;
    const cls = HTTP_COLORS[method] ?? 'bg-ds-bg3 text-ds-text3 border-ds-border';
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${cls}`}>{method}</span>;
}
