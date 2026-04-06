import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, LogOut, TrendingUp, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Badge from './ui/Badge'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['viewer', 'analyst', 'admin'] },
  { to: '/records',   label: 'Records',   Icon: FileText,         roles: ['viewer', 'analyst', 'admin'] },
  { to: '/users',     label: 'Users',     Icon: Users,            roles: ['admin'] },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const role = user?.role ?? 'viewer'

  const handleLogout = () => {
    toast.success('Signed out successfully')
    setTimeout(logout, 400)
  }

  return (
    <aside className="w-64 h-full min-h-screen bg-slate-900 border-r border-slate-800 text-white flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-5 h-14 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-900/50">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">FinSight</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</p>
        {NAV.filter((n) => n.roles.includes(role)).map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-800 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold uppercase flex-shrink-0">
            {user?.username?.[0] ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{user?.username}</p>
            <Badge label={role} type={role} />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-xl px-3 py-2.5 transition-all duration-150"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
