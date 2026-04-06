export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Icon size={15} />
          </div>
        )}
        <input
          className={[
            'w-full border rounded-xl px-3 py-2.5 text-sm',
            'bg-slate-800 text-slate-100 border-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-colors placeholder:text-slate-500',
            error ? 'border-rose-500 focus:ring-rose-500' : '',
            Icon ? 'pl-9' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  )
}
