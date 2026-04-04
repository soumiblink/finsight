export default function StatCard({ label, value, Icon, accent = 'blue', trend }) {
  const cfg = {
    green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' },
    red:    { bg: 'bg-rose-50',    icon: 'bg-rose-100    text-rose-600',    text: 'text-rose-600',    border: 'border-rose-200'    },
    blue:   { bg: 'bg-blue-50',    icon: 'bg-blue-100    text-blue-600',    text: 'text-blue-600',    border: 'border-blue-200'    },
    purple: { bg: 'bg-purple-50',  icon: 'bg-purple-100  text-purple-600',  text: 'text-purple-600',  border: 'border-purple-200'  },
  }
  const c = cfg[accent] || cfg.blue

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 tabular-nums">
          {value !== null && value !== undefined
            ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '—'}
        </p>
        {trend !== undefined && (
          <p className={`text-xs mt-0.5 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
          </p>
        )}
      </div>
    </div>
  )
}
