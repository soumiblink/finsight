export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-2xl mb-3 shadow-inner">
        {icon}
      </div>
      <p className="text-slate-300 font-semibold text-sm">{title}</p>
      {message && <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
