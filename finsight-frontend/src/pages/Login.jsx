import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const ROLES = ['viewer', 'analyst', 'admin']

export default function Login() {
  const { login, register, error, setError, user } = useAuth()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', confirm: '', role: 'viewer' })
  const [localErr, setLocalErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

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
    if (tab === 'login') {
      await login(form.username, form.password)
      // toast on success is handled by redirect; error is shown inline
    } else {
      await register(form.username, form.password, form.role)
      if (!error) toast.success('Account created! Signing you in…')
    }
    setLoading(false)
  }

  const displayErr = localErr || error
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors placeholder:text-gray-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center px-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">FinSight</h1>
          <p className="text-blue-200/70 text-sm mt-1">Finance management dashboard</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {displayErr && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              {displayErr}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
              <input required type="text" value={form.username} onChange={f('username')}
                className={inputCls} placeholder="Enter your username" autoComplete="username" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} value={form.password} onChange={f('password')}
                  className={inputCls + ' pr-10'} placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <input required type="password" value={form.confirm} onChange={f('confirm')}
                    className={inputCls} placeholder="Repeat your password" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Role</label>
                  <select value={form.role} onChange={f('role')} className={inputCls + ' bg-white'}>
                    {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs text-center">
                    {[
                      { r: 'viewer',  desc: 'Read only',  color: 'bg-gray-100 text-gray-600' },
                      { r: 'analyst', desc: 'Analytics',  color: 'bg-blue-50 text-blue-600' },
                      { r: 'admin',   desc: 'Full access', color: 'bg-purple-50 text-purple-600' },
                    ].map(({ r, desc, color }) => (
                      <div key={r} className={`rounded-lg px-2 py-1.5 font-medium ${color}`}>
                        <div className="capitalize font-semibold">{r}</div>
                        <div className="text-[10px] opacity-75">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-2" size="lg">
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-5">
            {tab === 'login'
              ? <>No account?{' '}<button onClick={() => switchTab('register')} className="text-blue-600 hover:underline font-medium">Register here</button></>
              : <>Have an account?{' '}<button onClick={() => switchTab('login')} className="text-blue-600 hover:underline font-medium">Sign in</button></>}
          </p>
        </div>
      </div>
    </div>
  )
}
