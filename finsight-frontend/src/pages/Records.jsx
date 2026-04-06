import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, X, Filter, SlidersHorizontal } from 'lucide-react'
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

const inputCls = 'w-full border border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-800 text-slate-200 placeholder:text-slate-500 transition-colors'
const labelCls = 'block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide'

function renderCell(value) {
  if (value === null || value === undefined) return <span className="text-slate-700">—</span>
  if (typeof value === 'boolean') return value
    ? <span className="inline-flex items-center text-emerald-400 font-medium text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">Yes</span>
    : <span className="inline-flex items-center text-rose-400 font-medium text-xs bg-rose-500/10 px-2 py-0.5 rounded-full">No</span>
  if (typeof value === 'object') return value.title ?? JSON.stringify(value)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (typeof value === 'number' && String(value).includes('.'))
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })
  return String(value)
}

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
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Records</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your financial records</p>
          </div>
          {isAdmin && (
            <Button onClick={() => { setShowForm(true); setFormError(null) }}>
              <Plus size={14} />
              {addLabel}
            </Button>
          )}
        </div>

        {/* Tabs + filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Tab pill */}
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                  tab === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records…"
                className={`${inputCls} pl-8 py-2`} />
            </div>
            <input value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Category" className={`${inputCls} flex-1 min-w-[110px] py-2`} />
            <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)}
              className={`${inputCls} flex-1 min-w-[130px] py-2`} />
            <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)}
              className={`${inputCls} flex-1 min-w-[130px] py-2`} />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="flex-shrink-0 text-slate-500 hover:text-slate-200">
                <X size={12} />
                Clear
              </Button>
            )}
          </div>
          {hasFilters && (
            <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
              <SlidersHorizontal size={10} />
              {filtered.length} of {records.length} records
            </p>
          )}
        </Card>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {columns.map((col) => (
                    <th key={col} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                  {isAdmin && (
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
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
                            <X size={12} /> Clear filters
                          </Button>
                        ) : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                      {columns.map((col) => (
                        <td key={col} className="px-5 py-3.5 text-slate-300 max-w-xs truncate text-sm">
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
          {/* Table footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between">
              <p className="text-xs text-slate-600">
                {hasFilters ? `${filtered.length} of ${records.length}` : records.length} {tab}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      {showForm && (
        <Modal title={addLabel} onClose={() => setShowForm(false)}>
          {formError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-3 py-2.5 rounded-xl whitespace-pre-wrap">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input required type="text" value={formData.title || ''} onChange={field('title')} className={inputCls} placeholder="Enter title" />
            </div>
            <div>
              <label className={labelCls}>{tab === 'budgets' ? 'Total Amount' : 'Amount'}</label>
              <input required type="number" step="0.01" min="0.01"
                value={tab === 'budgets' ? formData.total_amount || '' : formData.amount || ''}
                onChange={field(tab === 'budgets' ? 'total_amount' : 'amount')}
                className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Description <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
              <input type="text" value={formData.desc || ''} onChange={field('desc')} className={inputCls} placeholder="Add a note…" />
            </div>
            {tab === 'budgets' && (
              <div>
                <label className={labelCls}>End Date</label>
                <input required type="datetime-local" value={formData.to || ''} onChange={field('to')} className={inputCls} />
              </div>
            )}
            {tab === 'expenses' && (
              <div>
                <label className={labelCls}>Budget</label>
                {budgets.length === 0 ? (
                  <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-2.5 rounded-xl">
                    No budgets yet — switch to the <strong>Budgets</strong> tab and create one first.
                  </div>
                ) : (
                  <select required value={formData.budget || ''} onChange={field('budget')} className={inputCls}>
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
            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={submitting} disabled={tab === 'expenses' && budgets.length === 0} className="flex-1 justify-center">
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
