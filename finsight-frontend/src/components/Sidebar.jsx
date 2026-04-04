import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, LogOut, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Badge from './ui/Badge'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['viewer', 'analyst', 'admin'] },
  { to: '/records',   label: 'Records',   Icon: FileText,         roles: ['viewer', 'analyst', 'admin'] },
  { to: '/users',     label: 'Users',     Icon: Users,            roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const role = user?.role ?? 'viewer'

  const handleLogout = () => {
    toast.success('Signed out successfully')
    setTimeout(logout, 400)
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-950 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">FinSight</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.filter((n) => n.roles.includes(role)).map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-800 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
            {user?.username?.[0] ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <Badge label={role} type={role} />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl px-3.5 py-2.5 transition-all duration-150"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
