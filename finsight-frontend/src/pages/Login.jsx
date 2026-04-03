import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = ['viewer', 'analyst', 'admin']

export default function Login() {
  const { login, register, error, setError, user } = useAuth()
  const [tab, setTab] = useState('login') // 'login' | 'register'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState(null)

  if (user && localStorage.getItem('access_token')) {
    return <Navigate to="/dashboard" replace />
  }

  const switchTab = (t) => {
    setTab(t)
    setLocalError(null)
    setError(null)
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setRole('viewer')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    setError(null)

    if (tab === 'register' && password !== confirmPassword) {
      setLocalError("Passwords don't match.")
      return
    }

    setLoading(true)
    if (tab === 'login') {
      await login(username, password)
    } else {
      await register(username, password, role)
    }
    setLoading(false)
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow p-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">FinSight</h1>
        <p className="text-sm text-gray-500 mb-6">Finance management dashboard</p>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-blue-700 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-blue-700 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {displayError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          {/* Register-only fields */}
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  viewer → read only &nbsp;|&nbsp; analyst → analytics &nbsp;|&nbsp; admin → full access
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {loading
              ? tab === 'login' ? 'Signing in...' : 'Creating account...'
              : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-5">
          {tab === 'login' ? (
            <>No account?{' '}
              <button onClick={() => switchTab('register')} className="text-blue-600 hover:underline">
                Register here
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => switchTab('login')} className="text-blue-600 hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
