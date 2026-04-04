const styles = {
  admin:    'bg-purple-100 text-purple-700 ring-purple-200',
  analyst:  'bg-blue-100   text-blue-700   ring-blue-200',
  viewer:   'bg-gray-100   text-gray-600   ring-gray-200',
  active:   'bg-emerald-100 text-emerald-700 ring-emerald-200',
  inactive: 'bg-rose-100   text-rose-600   ring-rose-200',
}

export default function Badge({ label, type }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ring-1 ${styles[type] || styles.viewer}`}>
      {label}
    </span>
  )
}
