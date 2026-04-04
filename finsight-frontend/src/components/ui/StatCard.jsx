export default function StatCard({ label, value, icon, accent }) {
  const accents = {
    green:  'border-emerald-500 bg-emerald-50 text-emerald-600',
    red:    'border-rose-500    bg-rose-50    text-rose-600',
    blue:   'border-blue-500   bg-blue-50    text-blue-600',
    purple: 'border-purple-500 bg-purple-50  text-purple-600',
  }
  const cls = accents[accent] || accents.blue

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl border-l-4 ${cls}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">
          {value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : '—'}
        </p>
      </div>
    </div>
  )
}
