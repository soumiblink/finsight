const styles = {
  admin:    'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  analyst:  'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
  viewer:   'bg-slate-500/15  text-slate-400  ring-slate-600/40',
  active:   'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  inactive: 'bg-rose-500/15   text-rose-300   ring-rose-500/30',
}

export default function Badge({ label, type }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ring-1 leading-5 ${styles[type] || styles.viewer}`}>
      {label}
    </span>
  )
}
