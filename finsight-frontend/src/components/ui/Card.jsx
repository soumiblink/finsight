export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={[
      'bg-white rounded-2xl border border-gray-100 shadow-sm',
      hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
