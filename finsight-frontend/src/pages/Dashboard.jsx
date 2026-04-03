import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getAnalyticsSummary, getAnalyticsInsights, getMonthlyTrends } from '../api/records'

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${color}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value !== null ? `$${Number(value).toFixed(2)}` : '—'}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [insights, setInsights] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        // All three are independent — fetch in parallel
        const [summaryRes, insightsRes, trendsRes] = await Promise.allSettled([
          getAnalyticsSummary(),
          getAnalyticsInsights(),
          getMonthlyTrends(),
        ])

        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value.data)
        } else {
          console.error('Summary fetch failed:', summaryRes.reason)
        }

        if (insightsRes.status === 'fulfilled') {
          setInsights(insightsRes.value.data?.category_breakdown ?? [])
        } else {
          console.error('Insights fetch failed:', insightsRes.reason)
        }

        if (trendsRes.status === 'fulfilled') {
          setTrends(trendsRes.value.data ?? [])
        } else {
          console.error('Trends fetch failed:', trendsRes.reason)
        }
      } catch (err) {
        setError('Failed to load dashboard data.')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Dashboard</h2>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="text-sm text-gray-500">Loading summary...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Income"
              value={summary?.total_income ?? null}
              color="border-green-500"
            />
            <StatCard
              label="Total Expense"
              value={summary?.total_expense ?? null}
              color="border-red-500"
            />
            <StatCard
              label="Balance"
              value={summary?.balance ?? null}
              color="border-blue-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              Expenses by Category
            </h3>
            {insights.length === 0 ? (
              <p className="text-sm text-gray-400">No category data available.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-gray-700">
                        {row.categories__title ?? 'Uncategorized'}
                      </td>
                      <td className="py-2 text-right text-gray-800 font-medium">
                        ${Number(row.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              Monthly Expense Trends
            </h3>
            {trends.length === 0 ? (
              <p className="text-sm text-gray-400">No trend data available.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Month</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-gray-700">
                        {row.month
                          ? new Date(row.month).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="py-2 text-right text-gray-800 font-medium">
                        ${Number(row.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
