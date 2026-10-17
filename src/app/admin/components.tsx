'use client';

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
        {sub && <p className="text-sm text-white/40 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function DataTable({ columns, rows, empty }: { columns: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return (
    <div className="bg-[#141414] border border-white/10 rounded-md overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((c) => (
              <th key={c} className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-white/40 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-white/40 text-sm">
                {empty || 'No records.'}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-white/90 align-middle">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ value, map }: { value: string; map?: Record<string, string> }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/15 text-green-400',
    banned: 'bg-red-500/15 text-red-400',
    admin: 'bg-[#E50914]/15 text-[#E50914]',
    ...(map || {}),
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[value] || 'bg-white/10 text-white/60'}`}>
      {value}
    </span>
  );
}
