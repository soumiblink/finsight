import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16']

const fmtCurrency = (v) =>
  `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmtCurrency(p.value)}
        </p>
      ))}
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

  // Shape trends for recharts
  const trendData = trends.map((r) => ({
    month: r.month ? new Date(r.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '—',
    expense: Number(r.total) || 0,
  }))

  // Shape insights for pie
  const pieData = insights.map((r) => ({
    name: r.categories__title ?? 'Uncategorized',
    value: Number(r.total) || 0,
  }))

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-gray-700">{user?.username}</span>
            </p>
          </div>
          {canSeeAnalytics && (
            <Button variant="secondary" size="sm" onClick={load} loading={loading}>
              <RefreshCw size={14} />
              Refresh
            </Button>
          )}
        </div>

        {/* Viewer locked state */}
        {!canSeeAnalytics && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
            <h2 className="text-lg font-semibold text-gray-800">Analytics Restricted</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
              Your role (<span className="font-semibold capitalize text-gray-600">{role}</span>) does not have access to analytics.
              Ask an admin to upgrade your role to <span className="font-semibold text-blue-600">analyst</span> or <span className="font-semibold text-purple-600">admin</span>.
            </p>
          </Card>
        )}

        {/* Skeleton loading */}
        {canSeeAnalytics && loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[0,1,2].map((i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[0,1].map((i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="h-48 bg-gray-100 rounded-xl" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <StatCard
                label="Total Income"
                value={summary?.total_income}
                Icon={TrendingUp}
                accent="green"
              />
              <StatCard
                label="Total Expense"
                value={summary?.total_expense}
                Icon={TrendingDown}
                accent="red"
              />
              <StatCard
                label="Net Balance"
                value={summary?.balance}
                Icon={Wallet}
                accent="blue"
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

              {/* Monthly Trends — Area Chart (wider) */}
              <Card className="lg:col-span-3">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Monthly Expense Trends</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Spending over time</p>
                  </div>
                </div>
                <div className="p-6">
                  {trendData.length === 0 ? (
                    <EmptyState icon="📅" title="No trend data yet" message="Add expenses to see monthly trends." />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          name="Expense"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          fill="url(#expGrad)"
                          dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: '#3b82f6' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Category Breakdown — Pie Chart (narrower) */}
              <Card className="lg:col-span-2">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">By Category</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Expense distribution</p>
                </div>
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
                            innerRadius={45}
                            outerRadius={72}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => fmtCurrency(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {pieData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-gray-600 truncate">{d.name}</span>
                            </div>
                            <span className="font-semibold text-gray-800 ml-2 flex-shrink-0">{fmtCurrency(d.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Category Bar Chart */}
            {pieData.length > 0 && (
              <Card>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">Category Comparison</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Total spend per category</p>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pieData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]}>
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
