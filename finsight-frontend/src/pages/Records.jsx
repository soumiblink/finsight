import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import {
  getIncome, createIncome, deleteIncome,
  getExpenses, createExpense, deleteExpense,
  getBudgets, createBudget, deleteBudget,
} from '../api/records'

const TABS = ['expenses', 'income', 'budgets']
const HIDDEN = ['user', 'receipt']

const INIT = {
  expenses: { title: '', amount: '', desc: '', budget: '' },
  income:   { title: '', amount: '', desc: '' },
  budgets:  { title: '', total_amount: '', desc: '', to: defaultTo() },
}

function defaultTo() {
  const d = new Date(); d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 16)
}

function renderCell(value) {
  if (value === null || value === undefined) return <span className="text-gray-300">—</span>
  if (typeof value === 'boolean') return value
    ? <span className="text-emerald-600 font-medium">Yes</span>
    : <span className="text-rose-500 font-medium">No</span>
  if (typeof value === 'object') return value.title ?? JSON.stringify(value)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return new Date(value).toLocaleDateString()
  return String(value)
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50'

export default function Records() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [tab, setTab] = useState('expenses')
  const [records, setRecords] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // filters
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  // modal
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(INIT.expenses)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await getBudgets()
      setBudgets(res.data?.results ?? res.data ?? [])
    } catch (e) { console.error('Budgets:', e) }
  }, [])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  const fetchRecords = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      let res
      if (tab === 'expenses') res = await getExpenses()
      else if (tab === 'income') res = await getIncome()
      else res = await getBudgets()
      const data = res.data?.results ?? res.data
      setRecords(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Failed to load records.')
      console.error(e)
      setRecords([])
    } finally { setLoading(false) }
  }, [tab])

  useEffect(() => {
    fetchRecords()
    setFormData(INIT[tab])
    setShowForm(false)
    setFormError(null)
    setSearch(''); setFilterCategory(''); setFilterStart(''); setFilterEnd('')
  }, [tab])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      if (tab === 'expenses') await deleteExpense(id)
      else if (tab === 'income') await deleteIncome(id)
      else await deleteBudget(id)
      setRecords((p) => p.filter((r) => r.id !== id))
      if (tab === 'budgets') fetchBudgets()
    } catch (e) { alert('Delete failed.'); console.error(e) }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setFormError(null); setSubmitting(true)
    try {
      if (tab === 'expenses') await createExpense(formData)
      else if (tab === 'income') await createIncome(formData)
      else await createBudget(formData)
      setShowForm(false); setFormData(INIT[tab])
      await fetchRecords()
      if (tab === 'budgets') fetchBudgets()
    } catch (err) {
      const d = err.response?.data
      setFormError(d ? (typeof d === 'string' ? d : JSON.stringify(d, null, 2)) : 'Failed to save.')
      console.error(err)
    } finally { setSubmitting(false) }
  }

  const field = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }))

  // client-side filter
  const filtered = records.filter((r) => {
    const s = search.toLowerCase()
    const matchSearch = !s || Object.values(r).some((v) => String(v).toLowerCase().includes(s))
    const matchCat = !filterCategory || JSON.stringify(r).toLowerCase().includes(filterCategory.toLowerCase())
    const matchStart = !filterStart || new Date(r.added_at) >= new Date(filterStart)
    const matchEnd = !filterEnd || new Date(r.added_at) <= new Date(filterEnd)
    return matchSearch && matchCat && matchStart && matchEnd
  })

  const columns = records.length > 0
    ? Object.keys(records[0]).filter((k) => !HIDDEN.includes(k))
    : ['id', 'title', 'amount', 'added_at']

  const addLabel = tab === 'expenses' ? 'Add Expense' : tab === 'income' ? 'Add Income' : 'Add Budget'

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Records</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your financial records</p>
          </div>
          {isAdmin && (
            <Button onClick={() => { setShowForm(true); setFormError(null) }}>
              + {addLabel}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search…" className={inputCls} />
            <input value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Filter by category" className={inputCls} />
            <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)}
              className={inputCls} />
            <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)}
              className={inputCls} />
          </div>
        </Card>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={tab === 'budgets' ? '💼' : tab === 'income' ? '💵' : '💸'}
              title={`No ${tab} found`}
              message={tab === 'expenses' && budgets.length === 0 && isAdmin
                ? 'Create a budget first in the Budgets tab.'
                : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                    {isAdmin && <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="px-5 py-3.5 text-gray-700 max-w-xs truncate">
                          {renderCell(record[col])}
                        </td>
                      ))}
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="danger" size="sm" onClick={() => handleDelete(record.id)}>
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      {showForm && (
        <Modal title={addLabel} onClose={() => setShowForm(false)}>
          {formError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-lg whitespace-pre-wrap">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input required type="text" value={formData.title || ''} onChange={field('title')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {tab === 'budgets' ? 'Total Amount' : 'Amount'}
              </label>
              <input required type="number" step="0.01" min="0.01"
                value={tab === 'budgets' ? formData.total_amount || '' : formData.amount || ''}
                onChange={field(tab === 'budgets' ? 'total_amount' : 'amount')}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
              <input type="text" value={formData.desc || ''} onChange={field('desc')} className={inputCls} />
            </div>

            {tab === 'budgets' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input required type="datetime-local" value={formData.to || ''} onChange={field('to')} className={inputCls} />
              </div>
            )}

            {tab === 'expenses' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Budget</label>
                {budgets.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                    No budgets yet — go to the Budgets tab and create one first.
                  </p>
                ) : (
                  <select required value={formData.budget || ''} onChange={field('budget')}
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
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting || (tab === 'expenses' && budgets.length === 0)} className="flex-1 justify-center">
                {submitting ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 justify-center">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
