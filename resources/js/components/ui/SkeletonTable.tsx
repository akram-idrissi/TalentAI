import { Skeleton } from '@/components/ui/skeleton';

interface Props {
    cols: number;
    rows?: number;
}

export default function SkeletonTable({ cols, rows = 6 }: Props) {
    return (
        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                    <thead>
                        <tr className="border-ds-border border-b">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-4 py-3">
                                    <Skeleton className="h-3 w-20 bg-ds-bg3" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, row) => (
                            <tr key={row} className="border-ds-border border-b last:border-0">
                                {Array.from({ length: cols }).map((_, col) => (
                                    <td key={col} className="px-4 py-4">
                                        <Skeleton
                                            className="h-4 bg-ds-bg3"
                                            style={{ width: `${60 + ((row * cols + col) % 3) * 15}%` }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
