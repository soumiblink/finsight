import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Badge from './ui/Badge'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['viewer', 'analyst', 'admin'] },
  { to: '/records',   label: 'Records',   icon: '📋', roles: ['viewer', 'analyst', 'admin'] },
  { to: '/users',     label: 'Users',     icon: '👥', roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const role = user?.role ?? 'viewer'

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold tracking-tight text-white">💰 FinSight</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.filter((n) => n.roles.includes(role)).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold uppercase">
            {user?.username?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <Badge label={role} type={role} />
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 text-left transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
