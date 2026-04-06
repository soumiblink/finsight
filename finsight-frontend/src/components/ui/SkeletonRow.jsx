export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse border-b border-slate-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 bg-slate-800 rounded-full" style={{ width: `${55 + (i * 17) % 35}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-md">
      <div className="w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-2.5 bg-slate-800 rounded-full w-20" />
        <div className="h-5 bg-slate-800 rounded-full w-28" />
      </div>
    </div>
  )
}
