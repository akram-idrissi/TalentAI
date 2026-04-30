import { ReactNode } from "react";

type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  emptyText?: string;
};

export default function DataTable<T>({
  data,
  columns,
  emptyText = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/50 
                    bg-white dark:bg-[#17171F]/70 backdrop-blur-xl shadow-sm overflow-hidden">

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* HEADER */}
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700/60 
                           bg-gray-50/70 dark:bg-[#1E1E28]/80">
              {columns.map((col, i) => (
                <th
                key={i}
                className={`
                    px-5 py-3 text-xs font-semibold uppercase tracking-wider
                    text-gray-500 dark:text-gray-400
                    text-center   
                    ${col.headerClassName || ""}
                `}
                >
                {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">

            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="group hover:bg-gray-50/60 dark:hover:bg-white/5 transition"
                >
                  {columns.map((col, colIndex) => (
                    <td
                    key={colIndex}
                    className={`
                        px-5 py-4 text-center  
                        ${col.cellClassName || ""}
                    `}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : col.accessor
                        ? (row[col.accessor] as ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}