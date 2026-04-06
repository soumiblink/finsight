import { Loader2 } from 'lucide-react'

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, className = '', ...props
}) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900',
    'disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
  ].join(' ')

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-900/50 focus:ring-blue-500',
    secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 focus:ring-slate-500',
    danger:    'bg-rose-600 text-white hover:bg-rose-500 shadow-sm focus:ring-rose-500',
    ghost:     'text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:ring-slate-500',
    outline:   'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 focus:ring-slate-500',
  }

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}
