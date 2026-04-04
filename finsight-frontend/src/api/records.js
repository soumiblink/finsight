import api from './axios'

// ── Income ────────────────────────────────────────────────────────────────────
export const getIncome    = ()        => api.get('/records/income')
export const createIncome = (data)    => api.post('/records/income', data)
export const updateIncome = (id, data)=> api.put(`/records/income/${id}`, data)
export const deleteIncome = (id)      => api.delete(`/records/income/${id}`)

// ── Expenses (MultiPartParser → FormData required) ────────────────────────────
const toForm = (data) => {
  const f = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) f.append(k, v)
  })
  return f
}

export const getExpenses    = ()         => api.get('/records/expenses')
export const createExpense  = (data)     => api.post('/records/expenses', toForm(data))
export const updateExpense  = (id, data) => api.put(`/records/expenses/${id}`, toForm(data))
export const deleteExpense  = (id)       => api.delete(`/records/expenses/${id}`)

// ── Budgets ───────────────────────────────────────────────────────────────────
export const getBudgets    = ()         => api.get('/records/budgets')
export const createBudget  = (data)     => api.post('/records/budgets', data)
export const updateBudget  = (id, data) => api.put(`/records/budgets/${id}`, data)
export const deleteBudget  = (id)       => api.delete(`/records/budgets/${id}`)

// ── Sources & Categories ──────────────────────────────────────────────────────
export const getSources    = ()         => api.get('/records/sources')
export const getCategories = ()         => api.get('/records/categories')
