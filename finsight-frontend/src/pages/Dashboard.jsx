import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { getAnalyticsSummary, getAnalyticsInsights, getMonthlyTrends } from '../api/analytics'

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role ?? 'viewer'
  const canSeeAnalytics = ['analyst', 'admin'].includes(role)

  const [summary, setSummary] = useState(null)
  const [insights, setInsights] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!canSeeAnalytics) { setLoading(false); return }

    const load = async () => {
      setLoading(true)
      const [s, i, t] = await Promise.allSettled([
        getAnalyticsSummary(),
        getAnalyticsInsights(),
        getMonthlyTrends(),
      ])
      if (s.status === 'fulfilled') setSummary(s.value.data)
      else console.error('Summary:', s.reason)
      if (i.status === 'fulfilled') setInsights(i.value.data?.category_breakdown ?? [])
      else console.error('Insights:', i.reason)
      if (t.status === 'fulfilled') setTrends(t.value.data ?? [])
      else console.error('Trends:', t.reason)
      setLoading(false)
    }
    load()
  }, [canSeeAnalytics])

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="font-medium text-gray-700">{user?.username}</span>
          </p>
        </div>

        {/* Viewer notice */}
        {!canSeeAnalytics && (
          <Card className="p-8 text-center">
            <span className="text-4xl">🔒</span>
            <h2 className="text-lg font-semibold text-gray-700 mt-3">Analytics Restricted</h2>
            <p className="text-gray-400 text-sm mt-1">
              Your role (<span className="font-medium capitalize">{role}</span>) does not have access to analytics.
              Contact an admin to upgrade your role.
            </p>
          </Card>
        )}

        {canSeeAnalytics && loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {canSeeAnalytics && !loading && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <StatCard label="Total Income"  value={summary?.total_income}  icon="💵" accent="green"  />
              <StatCard label="Total Expense" value={summary?.total_expense} icon="💸" accent="red"    />
              <StatCard label="Net Balance"   value={summary?.balance}       icon="📈" accent="blue"   />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category breakdown */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Expenses by Category</h3>
                </div>
                <div className="p-6">
                  {insights.length === 0 ? (
                    <EmptyState icon="📂" title="No category data" message="Add expenses with categories to see breakdown." />
                  ) : (
                    <div className="space-y-3">
                      {insights.map((row, i) => {
                        const pct = summary?.total_expense
                          ? Math.min(100, (row.total / summary.total_expense) * 100)
                          : 0
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{row.categories__title ?? 'Uncategorized'}</span>
                              <span className="font-medium text-gray-800">${Number(row.total).toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>

              {/* Monthly trends */}
              <Card>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">Monthly Expense Trends</h3>
                </div>
                <div className="p-6">
                  {trends.length === 0 ? (
                    <EmptyState icon="📅" title="No trend data" message="Expenses will appear here once recorded." />
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-100">
                          <th className="pb-2 font-medium">Month</th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.map((row, i) => (
                          <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="py-2.5 text-gray-600">
                              {row.month ? new Date(row.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}
                            </td>
                            <td className="py-2.5 text-right font-semibold text-gray-800">
                              ${Number(row.total).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
