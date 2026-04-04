import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const ROLES = ['viewer', 'analyst', 'admin']

export default function Login() {
  const { login, register, error, setError, user } = useAuth()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', confirm: '', role: 'viewer' })
  const [localErr, setLocalErr] = useState(null)
  const [loading, setLoading] = useState(false)

  if (user && localStorage.getItem('access_token')) return <Navigate to="/dashboard" replace />

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const switchTab = (t) => {
    setTab(t); setLocalErr(null); setError(null)
    setForm({ username: '', password: '', confirm: '', role: 'viewer' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLocalErr(null); setError(null)
    if (tab === 'register' && form.password !== form.confirm) {
      setLocalErr("Passwords don't match."); return
    }
    setLoading(true)
    if (tab === 'login') await login(form.username, form.password)
    else await register(form.username, form.password, form.role)
    setLoading(false)
  }

  const displayErr = localErr || error
  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <span className="text-3xl">💰</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">FinSight</h1>
          <p className="text-sm text-gray-500">Finance management dashboard</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {displayErr && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5 rounded-lg">
            {displayErr}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
            <input required type="text" value={form.username} onChange={f('username')} className={inputCls} placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input required type="password" value={form.password} onChange={f('password')} className={inputCls} placeholder="Enter password" />
          </div>

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
                <input required type="password" value={form.confirm} onChange={f('confirm')} className={inputCls} placeholder="Repeat password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={form.role} onChange={f('role')} className={inputCls + ' bg-white'}>
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">viewer → read only · analyst → analytics · admin → full access</p>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full justify-center mt-2">
            {loading ? (tab === 'login' ? 'Signing in…' : 'Creating account…') : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-5">
          {tab === 'login'
            ? <>No account? <button onClick={() => switchTab('register')} className="text-blue-600 hover:underline">Register</button></>
            : <>Have an account? <button onClick={() => switchTab('login')} className="text-blue-600 hover:underline">Sign in</button></>}
        </p>
      </div>
    </div>
  )
}
