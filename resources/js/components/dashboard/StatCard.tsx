interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendType: 'up' | 'down' | 'stable';
    accentColor: 'blue' | 'green' | 'amber' | 'purple';
}

const accentMap: Record<StatCardProps['accentColor'], string> = {
    blue: 'from-stat-blue to-ds-accent3',
    green: 'from-stat-green to-emerald-300',
    amber: 'from-stat-amber to-yellow-200',
    purple: 'from-stat-purple to-violet-300',
};

const trendStyles: Record<StatCardProps['trendType'], { color: string; icon: string }> = {
    up: { color: 'text-score-high', icon: '↑' },
    down: { color: 'text-ds-red', icon: '↓' },
    stable: { color: 'text-ds-text3', icon: '→' },
};

export default function StatCard({ title, value, trend, trendType, accentColor }: StatCardProps) {
    const { color, icon } = trendStyles[trendType];
    return (
        <div className="border-ds-border bg-dash-card hover:border-ds-border2 relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5">
            <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentMap[accentColor]}`} />
            <p className="text-ds-text3 text-[10px] font-semibold tracking-widest uppercase">{title}</p>
            <p className="font-heading text-ds-text mt-3 text-4xl font-bold tracking-tight">{value}</p>
            <p className={`mt-2 text-xs font-medium ${color}`}>
                {icon} {trend}
            </p>
        </div>
    );
}
