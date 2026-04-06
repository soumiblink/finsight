export default function StatCard({ label, value, Icon, accent = 'blue', trend }) {
  const cfg = {
    green:  { border: 'border-emerald-500/25', icon: 'bg-emerald-500/15 text-emerald-400', val: 'text-emerald-400', glow: 'shadow-emerald-900/20' },
    red:    { border: 'border-rose-500/25',    icon: 'bg-rose-500/15    text-rose-400',    val: 'text-rose-400',    glow: 'shadow-rose-900/20'    },
    blue:   { border: 'border-blue-500/25',    icon: 'bg-blue-500/15    text-blue-400',    val: 'text-blue-400',    glow: 'shadow-blue-900/20'    },
    purple: { border: 'border-purple-500/25',  icon: 'bg-purple-500/15  text-purple-400',  val: 'text-purple-400',  glow: 'shadow-purple-900/20'  },
  }
  const c = cfg[accent] || cfg.blue

  return (
    <div className={`bg-slate-900 rounded-2xl border ${c.border} p-5 flex items-center gap-4 shadow-md ${c.glow} hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`}>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 tabular-nums tracking-tight ${c.val}`}>
          {value !== null && value !== undefined
            ? Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—'}
        </p>
        {trend !== undefined && (
          <p className={`text-xs mt-0.5 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
          </p>
        )}
      </div>
    </div>
  )
}
