import { ReactNode } from "react";

type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => ReactNode;
};

type Props<T> = {
  data: T[];
};

export default function CandidateTable<T extends any>({ data }: Props<T>) {
  const columns: Column<any>[] = [
    {
      header: "#",
      render: (_row, index: number) => index + 1,
    },
    {
      header: "Candidat",
      render: (row) => (
        <div>
          <p className="font-heading text-ds-text">{row.name}</p>
          <p className="font-heading text-xs text-ds-text3">{row.location}</p>
        </div>
      ),
    },
    {
      header: "Source",
      render: (row) => (
        <span className="font-heading text-[11px] bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20 px-2 py-1 rounded">
          {row.source}
        </span>
      ),
    },
    {
      header: "Poste",
      accessor: "job",
    },
    {
      header: "Expérience",
      accessor: "experience",
    },
    {
      header: "Score IA",
      render: (row) => (
        <span
          className={`font-bold ${
            row.score > 85
              ? "text-ds-green"
              : row.score > 70
              ? "text-ds-amber"
              : "text-ds-red"
          }`}
        >
          {row.score}
        </span>
      ),
    },
    {
      header: "Action",
      render: () => (
        <button className="text-ds-green border border-ds-green/30 px-2 py-1 rounded text-xs hover:bg-ds-green/10 transition">
          Inviter
        </button>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-ds-text3 text-[10px] border-b border-ds-border uppercase tracking-wide">
            {columns.map((col, i) => (
              <th key={i} className="text-left py-2 px-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-ds-border hover:bg-ds-bg3/40 transition"
            >
              {columns.map((col, j) => (
                <td key={j} className="py-3 px-3 text-ds-text">
                  {col.render
                    ? col.render(row, i)
                    : row[col.accessor as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}