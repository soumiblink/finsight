import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import {
  getIncome, createIncome, deleteIncome,
  getExpenses, createExpense, deleteExpense,
  getBudgets, createBudget, deleteBudget,
} from '../api/records'

const TABS = ['expenses', 'income', 'budgets']
const HIDDEN = ['user', 'receipt']

// ── helpers ──────────────────────────────────────────────────────────────────

function renderCell(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return value.title ?? JSON.stringify(value)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return new Date(value).toLocaleDateString()
  return String(value)
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// ── today + 30 days as default budget end date ───────────────────────────────
function defaultTo() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
}

// ── initial form states ───────────────────────────────────────────────────────
const INIT = {
  expenses: { title: '', amount: '', desc: '', budget: '' },
  income:   { title: '', amount: '', desc: '' },
  budgets:  { title: '', total_amount: '', desc: '', to: defaultTo() },
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Records() {
  const [tab, setTab] = useState('expenses')
  const [records, setRecords] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(INIT.expenses)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // always keep budgets fresh (needed for expense dropdown + budgets tab)
  const fetchBudgets = async () => {
    try {
      const res = await getBudgets()
      setBudgets(res.data?.results ?? res.data ?? [])
    } catch (err) {
      console.error('Budgets fetch error:', err)
    }
  }

  useEffect(() => { fetchBudgets() }, [])

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (tab === 'expenses') res = await getExpenses()
      else if (tab === 'income') res = await getIncome()
      else res = await getBudgets()

      const data = res.data?.results ?? res.data
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load records.')
      console.error('Records fetch error:', err)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
    setFormData(INIT[tab])
    setShowForm(false)
    setFormError(null)
  }, [tab])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      if (tab === 'expenses') await deleteExpense(id)
      else if (tab === 'income') await deleteIncome(id)
      else await deleteBudget(id)

      setRecords((prev) => prev.filter((r) => r.id !== id))
      if (tab === 'budgets') fetchBudgets() // keep dropdown in sync
    } catch (err) {
      alert('Delete failed. See console.')
      console.error('Delete error:', err)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      if (tab === 'expenses') await createExpense(formData)
      else if (tab === 'income') await createIncome(formData)
      else await createBudget(formData)

      setShowForm(false)
      setFormData(INIT[tab])
      await fetchRecords()
      if (tab === 'budgets') fetchBudgets()
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        : 'Failed to create record.'
      setFormError(msg)
      console.error('Create error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }))

  const columns =
    records.length > 0
      ? Object.keys(records[0]).filter((k) => !HIDDEN.includes(k))
      : ['id', 'title', 'amount', 'added_at']

  const addLabel = tab === 'expenses' ? 'Add Expense' : tab === 'income' ? 'Add Income' : 'Add Budget'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Records</h2>
          <button
            onClick={() => { setShowForm(true); setFormError(null) }}
            className="bg-blue-700 text-white text-sm px-4 py-2 rounded hover:bg-blue-800 transition-colors"
          >
            + {addLabel}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">
              No {tab} found.
              {tab === 'expenses' && budgets.length === 0 && (
                <span className="ml-1 text-amber-600">
                  You need to create a budget first — switch to the Budgets tab.
                </span>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-700 max-w-xs truncate">
                        {renderCell(record[col])}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-800 mb-4">{addLabel}</h3>

            {formError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded whitespace-pre-wrap">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">

              {/* ── shared: title ── */}
              <FormField label="Title">
                <input required type="text" value={formData.title || ''}
                  onChange={(e) => field('title', e.target.value)} className={inputCls} />
              </FormField>

              {/* ── shared: amount / total_amount ── */}
              <FormField label={tab === 'budgets' ? 'Total Amount' : 'Amount'}>
                <input required type="number" step="0.01" min="0.01"
                  value={tab === 'budgets' ? formData.total_amount || '' : formData.amount || ''}
                  onChange={(e) => field(tab === 'budgets' ? 'total_amount' : 'amount', e.target.value)}
                  className={inputCls} />
              </FormField>

              {/* ── shared: description ── */}
              <FormField label="Description (optional)">
                <input type="text" value={formData.desc || ''}
                  onChange={(e) => field('desc', e.target.value)} className={inputCls} />
              </FormField>

              {/* ── budgets only: end date ── */}
              {tab === 'budgets' && (
                <FormField label="End Date">
                  <input required type="datetime-local" value={formData.to || ''}
                    onChange={(e) => field('to', e.target.value)} className={inputCls} />
                </FormField>
              )}

              {/* ── expenses only: budget selector ── */}
              {tab === 'expenses' && (
                <FormField label="Budget">
                  {budgets.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                      No budgets yet — go to the Budgets tab and create one first.
                    </p>
                  ) : (
                    <select required value={formData.budget || ''}
                      onChange={(e) => field('budget', e.target.value)}
                      className={inputCls + ' bg-white'}>
                      <option value="">Select a budget</option>
                      {budgets.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} — ${Number(b.amount_left ?? b.total_amount).toFixed(2)} left
                          {b.has_expired ? ' (expired)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting || (tab === 'expenses' && budgets.length === 0)}
                  className="flex-1 bg-blue-700 text-white py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
