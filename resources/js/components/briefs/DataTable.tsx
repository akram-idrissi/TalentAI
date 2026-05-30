import clsx from 'clsx';
import { ReactNode } from 'react';

export type Column<T> = {
    header: string;
    className?: string;
    headerClassName?: string;
    render: (row: T, index: number) => ReactNode;
};

type Props<T> = {
    data: T[];
    columns: Column<T>[];
};

export default function DataTable<T>({ data, columns }: Props<T>) {
    return (
        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                    {/* HEADER */}
                    <thead>
                        <tr className="border-ds-border border-b">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={clsx(
                                        'text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase',
                                        col.headerClassName,
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0">
                                {columns.map((col, j) => (
                                    <td key={j} className={clsx('text-ds-text2 px-4 py-3.5', col.className)}>
                                        {col.render(row, i)}
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
