export type BriefStatus = 'active' | 'sourcing' | 'interview';

const config: Record<BriefStatus, { label: string; className: string }> = {
    active: {
        label: 'Actif',
        className: 'bg-badge-active-bg text-badge-active-text border border-badge-active-text/20',
    },
    sourcing: {
        label: 'En sourcing',
        className: 'bg-badge-sourcing-bg text-badge-sourcing-text border border-badge-sourcing-text/20',
    },
    interview: {
        label: 'Entretiens',
        className: 'bg-badge-interview-bg text-badge-interview-text border border-badge-interview-text/20',
    },
};

export default function StatusBadge({ status }: { status: BriefStatus }) {
    const { label, className } = config[status];
    return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${className}`}>{label}</span>;
}
