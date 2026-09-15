import { useState, useMemo, useEffect } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function TempTable({ rows }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  if (rows.length === 0) return null;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Date</th>
              <th className="text-left px-3 py-2 font-medium">Temp Max (°C)</th>
              <th className="text-left px-3 py-2 font-medium">Temp Min (°C)</th>
              <th className="text-left px-3 py-2 font-medium">
                Apparent Max (°C)
              </th>
              <th className="text-left px-3 py-2 font-medium">
                Apparent Min (°C)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.map((row) => (
              <tr key={row.date} className="text-slate-700">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">{row.tempMax ?? "—"}</td>
                <td className="px-3 py-2">{row.tempMin ?? "—"}</td>
                <td className="px-3 py-2">{row.apparentTempMax ?? "—"}</td>
                <td className="px-3 py-2">{row.apparentTempMin ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          Rows per page:
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`px-2 py-1 rounded ${
                pageSize === size
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
