import { Loader2 } from 'lucide-react'

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, className = '', ...props
}) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
  ].join(' ')

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    danger:    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:ring-rose-500',
    ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    outline:   'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
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
