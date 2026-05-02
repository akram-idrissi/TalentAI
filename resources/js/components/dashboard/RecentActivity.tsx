type DotColor = 'green' | 'blue' | 'amber' | 'purple';

export interface ActivityItem {
    id: number;
    time: string;
    title: string;
    description: string;
    dotColor: DotColor;
}

const dotColorMap: Record<DotColor, string> = {
    green: 'bg-score-high',
    blue: 'bg-score-low',
    amber: 'bg-score-mid',
    purple: 'bg-stat-purple',
};

export default function RecentActivity({ activities }: { activities: ActivityItem[] }) {
    return (
        <section>
            <p className="text-ds-text3 mb-4 text-[11px] font-semibold tracking-[1px] uppercase">Activité récente</p>
            <div className="border-ds-border bg-dash-card rounded-xl border p-6 shadow-sm">
                <div className="flex flex-col">
                    {activities.map((item, index) => (
                        <div key={item.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColorMap[item.dotColor]}`} />
                                {index < activities.length - 1 && <div className="bg-ds-border my-1.5 w-px flex-1" style={{ minHeight: 20 }} />}
                            </div>
                            <div className="pb-5">
                                <p className="text-ds-text3 text-[11px]">{item.time}</p>
                                <p className="text-ds-text mt-0.5 text-[13px] font-medium">{item.title}</p>
                                <p className="text-ds-text2 mt-0.5 text-[12px]">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
