import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/SkeletonRow'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { getAnalyticsSummary, getAnalyticsInsights, getMonthlyTrends } from '../api/analytics'

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16']

const fmtCurrency = (v) =>
  Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-300 mb-1.5 text-xs uppercase tracking-wide">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold text-sm">
          {p.name}: <span className="tabular-nums">{fmtCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="px-5 py-4 border-b border-slate-800/80">
      <p className="text-sm font-semibold text-slate-200 tracking-tight">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role ?? 'viewer'
  const canSeeAnalytics = ['analyst', 'admin'].includes(role)

  const [summary, setSummary] = useState(null)
  const [insights, setInsights] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!canSeeAnalytics) { setLoading(false); return }
    setLoading(true)
    const [s, i, t] = await Promise.allSettled([
      getAnalyticsSummary(),
      getAnalyticsInsights(),
      getMonthlyTrends(),
    ])
    if (s.status === 'fulfilled') setSummary(s.value.data)
    if (i.status === 'fulfilled') setInsights(i.value.data?.category_breakdown ?? [])
    if (t.status === 'fulfilled') setTrends(t.value.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [canSeeAnalytics])

  const trendData = trends.map((r) => ({
    month: r.month ? new Date(r.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '—',
    expense: Number(r.total) || 0,
  }))

  const pieData = insights.map((r) => ({
    name: r.categories__title ?? 'Uncategorized',
    value: Number(r.total) || 0,
  }))

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back, <span className="text-slate-300 font-medium">{user?.username}</span>
            </p>
          </div>
          {canSeeAnalytics && (
            <Button variant="secondary" size="sm" onClick={load} loading={loading}>
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          )}
        </div>

        {/* Viewer locked */}
        {!canSeeAnalytics && (
          <Card className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-2xl mx-auto mb-4">🔒</div>
            <h2 className="text-base font-semibold text-slate-200">Analytics Restricted</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Your role (<span className="font-semibold capitalize text-slate-300">{role}</span>) doesn't have access to analytics.
              Ask an admin to upgrade to <span className="font-semibold text-indigo-400">analyst</span> or <span className="font-semibold text-violet-400">admin</span>.
            </p>
          </Card>
        )}

        {/* Skeleton */}
        {canSeeAnalytics && loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0,1,2].map((i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[0,1].map((i) => (
                <Card key={i} className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="h-3.5 bg-slate-800 rounded-full w-36" />
                    <div className="h-44 bg-slate-800/60 rounded-xl mt-4" />
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Content */}
        {canSeeAnalytics && !loading && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Income"   value={summary?.total_income}   Icon={TrendingUp}   accent="green" />
              <StatCard label="Total Expense"  value={summary?.total_expense}  Icon={TrendingDown} accent="red"   />
              <StatCard label="Net Balance"    value={summary?.balance}        Icon={Wallet}       accent="blue"  />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Area chart */}
              <Card className="lg:col-span-3">
                <CardHeader title="Monthly Expense Trends" subtitle="Spending over time" />
                <div className="p-5">
                  {trendData.length === 0 ? (
                    <EmptyState icon="📅" title="No trend data yet" message="Add expenses to see monthly trends." />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          name="Expense"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fill="url(#expGrad)"
                          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Pie chart */}
              <Card className="lg:col-span-2">
                <CardHeader title="By Category" subtitle="Expense distribution" />
                <div className="p-4">
                  {pieData.length === 0 ? (
                    <EmptyState icon="📂" title="No category data" message="Categorize expenses to see breakdown." />
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={72}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {pieData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-slate-400 truncate">{d.name}</span>
                            </div>
                            <span className="font-semibold text-slate-200 ml-2 flex-shrink-0 tabular-nums">{fmtCurrency(d.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Bar chart */}
            {pieData.length > 0 && (
              <Card>
                <CardHeader title="Category Comparison" subtitle="Total spend per category" />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pieData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Amount" radius={[5, 5, 0, 0]}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
