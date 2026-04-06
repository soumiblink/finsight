export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={[
      'bg-slate-900 rounded-2xl border border-slate-800 shadow-md',
      hover && 'hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
