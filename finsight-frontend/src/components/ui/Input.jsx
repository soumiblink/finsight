export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={15} />
          </div>
        )}
        <input
          className={[
            'w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white',
            'transition-colors placeholder:text-gray-400',
            error ? 'border-rose-400 focus:ring-rose-400' : 'border-gray-200',
            Icon ? 'pl-9' : '',
            className,
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  )
}
