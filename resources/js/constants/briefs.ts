export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    active: { label: 'Actif', className: 'bg-badge-active-bg text-badge-active-text border border-badge-active-text/20' },
    draft: { label: 'Brouillon', className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
    sourcing: { label: 'En sourcing', className: 'bg-badge-sourcing-bg text-badge-sourcing-text border border-badge-sourcing-text/20' },
    interviews: { label: 'Entretiens', className: 'bg-badge-interview-bg text-badge-interview-text border border-badge-interview-text/20' },
};

export const ALL_STATUSES = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
}));
export const AVATAR_COLORS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#34D399] to-[#38BDF8]',
    'from-[#FBBF24] to-[#F87171]',
    'from-[#A78BFA] to-[#6C63FF]',
    'from-[#F87171] to-[#FBBF24]',
];
