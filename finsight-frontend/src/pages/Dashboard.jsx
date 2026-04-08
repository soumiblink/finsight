import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, RefreshCw,
  ArrowUpRight, ArrowDownRight, Activity,
  Lightbulb, CalendarDays, AlertTriangle, Sparkles,
} from 'lucide-react'
import Layout from '../components/Layout'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/SkeletonRow'
import { useAuth } from '../context/AuthContext'
import { getAnalyticsSummary, getDashboard } from '../api/analytics'

// ── Design tokens ─────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16']

// ── Currency formatter ────────────────────────────────────────────────────────
const fmtCurrency = (v, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
  }).format(Number(v) || 0)

const fmtShort = (v) => fmtCurrency(v, true)

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_TRENDS = [
  { month: 'Jan', income: 3200, expense: 1800 },
  { month: 'Feb', income: 2800, expense: 2100 },
  { month: 'Mar', income: 4100, expense: 2400 },
  { month: 'Apr', income: 3600, expense: 1950 },
  { month: 'May', income: 4800, expense: 3100 },
  { month: 'Jun', income: 4200, expense: 2700 },
]
const MOCK_CATEGORIES = [
  { name: 'Food',       value: 1200 },
  { name: 'Transport',  value: 640  },
  { name: 'Utilities',  value: 480  },
  { name: 'Shopping',   value: 920  },
  { name: 'Healthcare', value: 310  },
]
const MOCK_ACTIVITY = [
  { type: 'income',  amount: 3200, date: '2026-06-01' },
  { type: 'expense', amount: 480,  date: '2026-05-30' },
  { type: 'expense', amount: 120,  date: '2026-05-28' },
  { type: 'income',  amount: 1000, date: '2026-05-25' },
  { type: 'expense', amount: 640,  date: '2026-05-22' },
]
const MOCK_SUMMARY = { total_income: 22700, total_expense: 14050, balance: 8650 }

// ── Helpers ───────────────────────────────────────────────────────────────────
function MockBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
      Sample data
    </span>
  )
}

function CardHeader({ title, subtitle, right, mock = false }) {
  return (
    <div className="px-5 py-4 border-b border-slate-800/80 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-200 tracking-tight">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {mock && <MockBadge />}
        {right}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/80 rounded-xl shadow-2xl px-4 py-3 text-sm min-w-[150px]">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-xs font-bold tabular-nums" style={{ color: p.color }}>
            {fmtShort(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Smart Insights ────────────────────────────────────────────────────────────
function computeInsights(trendData, pieData, summary) {
  const insights = []
  if (!trendData.length || !summary) return insights

  const last = trendData[trendData.length - 1]
  const prev = trendData[trendData.length - 2]

  // Month-over-month expense change
  if (prev && prev.expense > 0) {
    const pct = ((last.expense - prev.expense) / prev.expense) * 100
    const abs = Math.abs(pct).toFixed(0)
    if (pct > 5) {
      insights.push({
        icon: AlertTriangle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20',
        text: `You spent ${abs}% more this month compared to last month.`,
      })
    } else if (pct < -5) {
      insights.push({
        icon: Sparkles,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        text: `Great job! Expenses dropped ${abs}% compared to last month.`,
      })
    }
  }

  // Top spending category
  if (pieData.length > 0) {
    const top = [...pieData].sort((a, b) => b.value - a.value)[0]
    insights.push({
      icon: Lightbulb,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: `${top.name} is your highest expense category at ${fmtCurrency(top.value)}.`,
    })
  }

  // Savings rate
  if (summary.total_income > 0) {
    const rate = ((summary.total_income - summary.total_expense) / summary.total_income) * 100
    if (rate > 0) {
      insights.push({
        icon: TrendingUp,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/20',
        text: `Your savings rate is ${rate.toFixed(0)}% — ${rate > 20 ? 'excellent!' : rate > 10 ? 'on track.' : 'consider reducing expenses.'}`,
      })
    } else {
      insights.push({
        icon: AlertTriangle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20',
        text: `Expenses exceed income. You're spending ${fmtCurrency(Math.abs(summary.balance))} more than you earn.`,
      })
    }
  }

  // Income vs expense balance trend
  if (last) {
    const surplus = last.income - last.expense
    if (surplus > 0) {
      insights.push({
        icon: CalendarDays,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
        text: `This month you saved ${fmtCurrency(surplus)} after all expenses.`,
      })
    }
  }

  return insights.slice(0, 3)
}

// ── Activity table row ────────────────────────────────────────────────────────
function ActivityRow({ item, index }) {
  const isIncome = item.type === 'income'
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <tr
      className="hover:bg-slate-800/40 transition-colors group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{formattedDate}</td>
      <td className="px-5 py-3.5">
        <span className="text-xs text-slate-400 capitalize">{item.category ?? '—'}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
          isIncome
            ? 'bg-emerald-500/15 text-emerald-300'
            : 'bg-rose-500/15 text-rose-300'
        }`}>
          {isIncome ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {item.type}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className={`text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isIncome ? '+' : '-'}{fmtCurrency(item.amount)}
        </span>
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role ?? 'viewer'
  const canSeeAnalytics = ['analyst', 'admin'].includes(role)

  const [summary, setSummary]     = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading]     = useState(true)

  const load = async () => {
    if (!canSeeAnalytics) { setLoading(false); return }
    setLoading(true)
    const [s, d] = await Promise.allSettled([
      getAnalyticsSummary(),
      getDashboard(),
    ])
    if (s.status === 'fulfilled') setSummary(s.value.data)
    if (d.status === 'fulfilled') setDashboard(d.value.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [canSeeAnalytics])

  // ── Data shaping with mock fallbacks ──────────────────────────────────────
  const rawTrends = (dashboard?.monthly_trends ?? []).map((r) => ({
    month:   r.month,
    income:  Number(r.income)  || 0,
    expense: Number(r.expense) || 0,
  }))
  const isTrendMock = rawTrends.length === 0
  const trendData   = isTrendMock ? MOCK_TRENDS : rawTrends

  const rawPie    = (dashboard?.category_breakdown ?? []).map((r) => ({
    name:  r.category ?? 'Uncategorized',
    value: Number(r.total) || 0,
  }))
  const isPieMock = rawPie.length === 0
  const pieData   = isPieMock ? MOCK_CATEGORIES : rawPie

  const rawActivity    = dashboard?.recent_activity ?? []
  const isActivityMock = rawActivity.length === 0
  const recentActivity = isActivityMock ? MOCK_ACTIVITY : rawActivity

  const isSummaryMock  = !summary || (summary.total_income === 0 && summary.total_expense === 0)
  const displaySummary = isSummaryMock ? MOCK_SUMMARY : summary

  const balanceData = trendData.map((r) => ({
    month:   r.month,
    balance: r.income - r.expense,
  }))

  // Current month spend from trend data
  const currentMonthExpense = trendData.length > 0 ? trendData[trendData.length - 1].expense : 0

  // Smart insights
  const insights = computeInsights(trendData, pieData, displaySummary)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6 fade-in">

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {[0,1,2].map((i) => (
                <Card key={i} className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-slate-800 rounded-full w-32" />
                    <div className="h-40 bg-slate-800/60 rounded-xl mt-4" />
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Content */}
        {canSeeAnalytics && !loading && (
          <>
            {/* ── 4 KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Income"
                value={displaySummary?.total_income}
                Icon={TrendingUp}
                accent="green"
                mock={isSummaryMock}
              />
              <StatCard
                label="Total Expenses"
                value={displaySummary?.total_expense}
                Icon={TrendingDown}
                accent="red"
                mock={isSummaryMock}
              />
              <StatCard
                label="Net Balance"
                value={displaySummary?.balance}
                Icon={Wallet}
                accent="blue"
                mock={isSummaryMock}
              />
              <StatCard
                label="This Month"
                value={currentMonthExpense}
                Icon={CalendarDays}
                accent="purple"
                mock={isTrendMock}
              />
            </div>

            {/* ── Smart Insights ── */}
            {insights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {insights.map((ins, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border ${ins.bg} transition-all duration-200 hover:-translate-y-0.5`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <ins.icon size={15} className={`${ins.color} flex-shrink-0 mt-0.5`} />
                    <p className="text-xs text-slate-300 leading-relaxed">{ins.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Row 1: Line chart + Pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Income vs Expense — Line */}
              <Card className="lg:col-span-3">
                <CardHeader
                  title="Monthly Trends"
                  subtitle="Income vs expenses over time"
                  mock={isTrendMock}
                />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={trendData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#94a3b8' }} />
                      <Line type="monotone" dataKey="income"  name="Income"  stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="expense" name="Expense" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Spending by Category — Pie */}
              <Card className="lg:col-span-2">
                <CardHeader title="Spending by Category" subtitle="Expense distribution" mock={isPieMock} />
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={74}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                        animationBegin={0}
                        animationDuration={600}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.9} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => [fmtCurrency(v), name]}
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {pieData.map((d, i) => {
                      const total = pieData.reduce((s, r) => s + r.value, 0)
                      const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0
                      return (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-slate-400 truncate">{d.name}</span>
                            <span className="text-slate-600 flex-shrink-0">{pct}%</span>
                          </div>
                          <span className="font-semibold text-slate-200 ml-2 flex-shrink-0 tabular-nums">{fmtShort(d.value)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Row 2: Bar + Net Balance + Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Category Comparison — Bar */}
              <Card className="lg:col-span-3">
                <CardHeader title="Category Comparison" subtitle="Total spend per category" mock={isPieMock} />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={pieData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={pieData.length > 5 ? -25 : 0}
                        textAnchor={pieData.length > 5 ? 'end' : 'middle'}
                        height={pieData.length > 5 ? 44 : 24}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]} maxBarSize={44} animationDuration={600}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Right col: Net Balance + Activity */}
              <div className="lg:col-span-2 flex flex-col gap-5">

                {/* Net Balance — Area */}
                <Card>
                  <CardHeader title="Net Balance Trend" subtitle="Monthly savings" mock={isTrendMock} />
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={110}>
                      <AreaChart data={balanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="balance" name="Balance" stroke="#6366f1" strokeWidth={2} fill="url(#balGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} animationDuration={600} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Recent Activity — table */}
                <Card className="flex-1">
                  <CardHeader
                    title="Recent Activity"
                    subtitle="Last 5 transactions"
                    mock={isActivityMock}
                    right={<Activity size={13} className="text-slate-600" />}
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800/60">
                          {['Date', 'Category', 'Type', 'Amount'].map((h) => (
                            <th key={h} className={`px-5 py-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap ${h === 'Amount' ? 'text-right' : 'text-left'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {recentActivity.map((item, i) => (
                          <ActivityRow key={i} item={item} index={i} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
