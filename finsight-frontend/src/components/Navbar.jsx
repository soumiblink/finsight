import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-white text-blue-700'
        : 'text-white hover:bg-blue-600'
    }`

  return (
    <nav className="bg-blue-700 px-6 py-3 flex items-center justify-between">
      <span className="text-white font-bold text-lg tracking-tight">FinSight</span>

      <div className="flex items-center gap-3">
        <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
        <Link to="/records" className={linkClass('/records')}>Records</Link>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-blue-200 text-sm hidden sm:block">
            {user.username ?? user.email ?? 'User'}
          </span>
        )}
        <button
          onClick={logout}
          className="text-sm bg-white text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
