export function scoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-violet-600';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
}

export function scoreBarColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-violet-500';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-red-500';
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');
}

export function formatTime(seconds?: number): string {
    if (seconds == null) return '';
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${m}:${s}`;
}
