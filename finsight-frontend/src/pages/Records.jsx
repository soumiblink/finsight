import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, X, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { SkeletonRow } from '../components/ui/SkeletonRow'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import {
  getIncome, createIncome, deleteIncome,
  getExpenses, createExpense, deleteExpense,
  getBudgets, createBudget, deleteBudget,
} from '../api/records'

const TABS = ['expenses', 'income', 'budgets']
const HIDDEN = ['user', 'receipt']

function defaultTo() {
  const d = new Date(); d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 16)
}

const INIT = {
  expenses: { title: '', amount: '', desc: '', budget: '' },
  income:   { title: '', amount: '', desc: '' },
  budgets:  { title: '', total_amount: '', desc: '', to: defaultTo() },
}

function renderCell(value) {
  if (value === null || value === undefined) return <span className="text-gray-300">—</span>
  if (typeof value === 'boolean') return value
    ? <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-full">Yes</span>
    : <span className="inline-flex items-center gap-1 text-rose-500 font-medium text-xs bg-rose-50 px-2 py-0.5 rounded-full">No</span>
  if (typeof value === 'object') return value.title ?? JSON.stringify(value)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (typeof value === 'number' && String(value).includes('.'))
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  return String(value)
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors'

export default function Records() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [tab, setTab] = useState('expenses')
  const [records, setRecords] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(INIT.expenses)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const hasFilters = search || filterCategory || filterStart || filterEnd
  const clearFilters = () => { setSearch(''); setFilterCategory(''); setFilterStart(''); setFilterEnd('') }

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
    clearFilters()
  }, [tab])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      if (tab === 'expenses') await deleteExpense(id)
      else if (tab === 'income') await deleteIncome(id)
      else await deleteBudget(id)
      setRecords((p) => p.filter((r) => r.id !== id))
      if (tab === 'budgets') fetchBudgets()
      toast.success('Record deleted')
    } catch (e) {
      toast.error('Delete failed')
      console.error(e)
    }
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
      toast.success(`${tab.slice(0, -1).charAt(0).toUpperCase() + tab.slice(1, -1)} created!`)
    } catch (err) {
      const d = err.response?.data
      const msg = d ? (typeof d === 'string' ? d : JSON.stringify(d, null, 2)) : 'Failed to save.'
      setFormError(msg)
      toast.error('Failed to save record')
      console.error(err)
    } finally { setSubmitting(false) }
  }

  const field = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }))

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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Records</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your financial records</p>
          </div>
          {isAdmin && (
            <Button onClick={() => { setShowForm(true); setFormError(null) }}>
              <Plus size={15} />
              {addLabel}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-150 ${
                tab === t
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records…"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
            <input value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Category" className={`${inputCls} flex-1 min-w-[120px]`} />
            <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)}
              className={`${inputCls} flex-1 min-w-[130px]`} />
            <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)}
              className={`${inputCls} flex-1 min-w-[130px]`} />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="flex-shrink-0">
                <X size={13} />
                Clear
              </Button>
            )}
          </div>
          {hasFilters && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Filter size={11} />
              Showing {filtered.length} of {records.length} records
            </p>
          )}
        </Card>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                  {isAdmin && (
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length + (isAdmin ? 1 : 0)} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (isAdmin ? 1 : 0)}>
                      <EmptyState
                        icon={tab === 'budgets' ? '💼' : tab === 'income' ? '💵' : '💸'}
                        title={`No ${tab} found`}
                        message={
                          hasFilters
                            ? 'Try clearing your filters.'
                            : tab === 'expenses' && budgets.length === 0 && isAdmin
                              ? 'Create a budget first in the Budgets tab.'
                              : undefined
                        }
                        action={hasFilters ? (
                          <Button variant="secondary" size="sm" onClick={clearFilters}>
                            <X size={13} /> Clear filters
                          </Button>
                        ) : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((record, idx) => (
                    <tr
                      key={record.id}
                      className={`transition-colors hover:bg-blue-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      {columns.map((col) => (
                        <td key={col} className="px-5 py-3.5 text-gray-700 max-w-xs truncate">
                          {renderCell(record[col])}
                        </td>
                      ))}
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="danger" size="xs" onClick={() => handleDelete(record.id)}>
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Modal */}
      {showForm && (
        <Modal title={addLabel} onClose={() => setShowForm(false)}>
          {formError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-xl whitespace-pre-wrap">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title</label>
              <input required type="text" value={formData.title || ''} onChange={field('title')} className={inputCls} placeholder="Enter title" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                {tab === 'budgets' ? 'Total Amount' : 'Amount'}
              </label>
              <input required type="number" step="0.01" min="0.01"
                value={tab === 'budgets' ? formData.total_amount || '' : formData.amount || ''}
                onChange={field(tab === 'budgets' ? 'total_amount' : 'amount')}
                className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
              <input type="text" value={formData.desc || ''} onChange={field('desc')} className={inputCls} placeholder="Add a note…" />
            </div>

            {tab === 'budgets' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">End Date</label>
                <input required type="datetime-local" value={formData.to || ''} onChange={field('to')} className={inputCls} />
              </div>
            )}

            {tab === 'expenses' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Budget</label>
                {budgets.length === 0 ? (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-xl">
                    No budgets yet — switch to the <strong>Budgets</strong> tab and create one first.
                  </div>
                ) : (
                  <select required value={formData.budget || ''} onChange={field('budget')} className={inputCls + ' bg-white'}>
                    <option value="">Select a budget…</option>
                    {budgets.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — ${Number(b.amount_left ?? b.total_amount).toFixed(2)} left{b.has_expired ? ' (expired)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                loading={submitting}
                disabled={tab === 'expenses' && budgets.length === 0}
                className="flex-1 justify-center"
              >
                Save
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
