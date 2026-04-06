import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, BarChart2, Shield, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const ROLES = ['viewer', 'analyst', 'admin']

const inputCls = 'w-full border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-800/80 text-slate-100 transition-colors placeholder:text-slate-500'
const labelCls = 'block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide'

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
    } else {
      await register(form.username, form.password, form.role)
      if (!error) toast.success('Account created! Signing you in…')
    }
    setLoading(false)
  }

  const displayErr = localErr || error

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-indigo-900/60">
            <TrendingUp size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FinSight</h1>
          <p className="text-slate-500 text-sm mt-1">Finance management dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-6">

          {/* Tabs */}
          <div className="flex mb-5 bg-slate-800/80 rounded-xl p-1">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  tab === t
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {displayErr && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-3.5 py-2.5 rounded-xl">
              {displayErr}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className={labelCls}>Username</label>
              <input required type="text" value={form.username} onChange={f('username')}
                className={inputCls} placeholder="Enter your username" autoComplete="username" />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} value={form.password} onChange={f('password')}
                  className={inputCls + ' pr-10'} placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input required type="password" value={form.confirm} onChange={f('confirm')}
                    className={inputCls} placeholder="Repeat your password" />
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <select value={form.role} onChange={f('role')} className={inputCls}>
                    {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-xs text-center">
                    {[
                      { r: 'viewer',  desc: 'Read only',   color: 'bg-slate-800 text-slate-400 ring-1 ring-slate-700/60' },
                      { r: 'analyst', desc: 'Analytics',   color: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30' },
                      { r: 'admin',   desc: 'Full access', color: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30' },
                    ].map(({ r, desc, color }) => (
                      <div key={r} className={`rounded-lg px-2 py-1.5 ${color}`}>
                        <div className="capitalize font-semibold text-[11px]">{r}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center !mt-5" size="md">
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-600 mt-4">
            {tab === 'login'
              ? <>No account?{' '}<button onClick={() => switchTab('register')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Register here</button></>
              : <>Have an account?{' '}<button onClick={() => switchTab('login')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</button></>}
          </p>
        </div>

        {/* Feature hints */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { Icon: BarChart2, label: 'Analytics' },
            { Icon: Shield,    label: 'Role-based' },
            { Icon: Zap,       label: 'Real-time' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <Icon size={14} className="text-slate-600" />
              <span className="text-[10px] text-slate-600 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
