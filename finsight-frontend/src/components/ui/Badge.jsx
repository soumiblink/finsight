const styles = {
  admin:    'bg-purple-100 text-purple-700',
  analyst:  'bg-blue-100   text-blue-700',
  viewer:   'bg-gray-100   text-gray-600',
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-rose-100   text-rose-700',
}

export default function Badge({ label, type }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${styles[type] || styles.viewer}`}>
      {label}
    </span>
  )
}
