import { ReactNode } from 'react';

interface Candidate {
    name: string;
    location: string;
    source: string;
    job: string;
    experience: string;
    score: number;
}

type Column = {
    header: string;
    accessor?: keyof Candidate;
    render?: (row: Candidate, index: number) => ReactNode;
};

type Props = {
    data: Candidate[];
};

export default function CandidateTable({ data }: Props) {
    const columns: Column[] = [
        {
            header: '#',
            render: (_row, index: number) => index + 1,
        },
        {
            header: 'Candidat',
            render: (row) => (
                <div>
                    <p className="font-heading text-ds-text">{row.name}</p>
                    <p className="font-heading text-ds-text3 text-xs">{row.location}</p>
                </div>
            ),
        },
        {
            header: 'Source',
            render: (row) => (
                <span className="font-heading bg-ds-accent/10 text-ds-accent2 border-ds-accent/20 rounded border px-2 py-1 text-[11px]">
                    {row.source}
                </span>
            ),
        },
        {
            header: 'Poste',
            accessor: 'job',
        },
        {
            header: 'Expérience',
            accessor: 'experience',
        },
        {
            header: 'Score IA',
            render: (row) => (
                <span className={`font-bold ${row.score > 85 ? 'text-ds-green' : row.score > 70 ? 'text-ds-amber' : 'text-ds-red'}`}>
                    {row.score}
                </span>
            ),
        },
        {
            header: 'Action',
            render: () => (
                <button className="text-ds-green border-ds-green/30 hover:bg-ds-green/10 rounded border px-2 py-1 text-xs transition">Inviter</button>
            ),
        },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
                <thead>
                    <tr className="text-ds-text3 border-ds-border border-b text-[10px] tracking-wide uppercase">
                        {columns.map((col, i) => (
                            <th key={i} className="px-3 py-2 text-left font-semibold">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="border-ds-border hover:bg-ds-bg3/40 border-b transition">
                            {columns.map((col, j) => (
                                <td key={j} className="text-ds-text px-3 py-3">
                                    {col.render ? col.render(row, i) : col.accessor ? String(row[col.accessor]) : null}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
