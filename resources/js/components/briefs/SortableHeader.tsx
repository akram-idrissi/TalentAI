import { SortDir } from '@/types/brief';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export default function SortableHeader({
    col,
    label,
    sortBy,
    sortDir,
    onSort,
}: {
    col: string;
    label: string;
    sortBy: string;
    sortDir: SortDir;
    onSort: (col: string) => void;
}) {
    const isActive = sortBy === col;
    return (
        <button
            onClick={() => onSort(col)}
            className={[
                'group inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.8px] uppercase transition',
                isActive ? 'text-ds-accent' : 'text-ds-text3 hover:text-ds-text2',
            ].join(' ')}
        >
            {label}
            <span className="opacity-60">
                {isActive ? (
                    sortDir === 'asc' ? (
                        <ArrowUp size={10} />
                    ) : (
                        <ArrowDown size={10} />
                    )
                ) : (
                    <ArrowUpDown size={10} className="opacity-0 transition group-hover:opacity-60" />
                )}
            </span>
        </button>
    );
}
