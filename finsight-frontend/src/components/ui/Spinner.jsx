import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 16, md: 24, lg: 40 }
  return <Loader2 size={s[size] || 24} className={`animate-spin text-blue-500 ${className}`} />
}
