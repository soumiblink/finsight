export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    danger:  'bg-rose-600  text-white hover:bg-rose-700  focus:ring-rose-500',
    ghost:   'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-4 py-2 gap-1.5',
    lg: 'text-base px-5 py-2.5 gap-2',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
