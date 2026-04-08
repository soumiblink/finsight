export default function StatCard({ label, value, Icon, accent = 'blue', trend, mock = false }) {
  const cfg = {
    green:  { border: 'border-emerald-500/20', icon: 'bg-emerald-500/15 text-emerald-400', val: 'text-emerald-400', glow: 'shadow-emerald-950/30' },
    red:    { border: 'border-rose-500/20',    icon: 'bg-rose-500/15    text-rose-400',    val: 'text-rose-400',    glow: 'shadow-rose-950/30'    },
    blue:   { border: 'border-blue-500/20',    icon: 'bg-blue-500/15    text-blue-400',    val: 'text-blue-400',    glow: 'shadow-blue-950/30'    },
    purple: { border: 'border-purple-500/20',  icon: 'bg-purple-500/15  text-purple-400',  val: 'text-purple-400',  glow: 'shadow-purple-950/30'  },
  }
  const c = cfg[accent] || cfg.blue

  const formatted = (value !== null && value !== undefined)
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value))
    : '—'

  return (
    <div className={`bg-slate-900 rounded-2xl border ${c.border} p-5 flex items-center gap-4 shadow-md ${c.glow} hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`}>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold mt-0.5 tabular-nums tracking-tight ${c.val}`}>
          {formatted}
        </p>
        {trend !== undefined && (
          <p className={`text-xs mt-0.5 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
          </p>
        )}
        {mock && (
          <p className="text-[10px] text-amber-500/70 mt-0.5">Sample</p>
        )}
      </div>
    </div>
  )
}
