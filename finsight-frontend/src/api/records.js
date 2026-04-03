import api from './axios'

// ── Income ──────────────────────────────────────────
export const getIncome = () => api.get('/records/income')
export const createIncome = (data) => api.post('/records/income', data)
export const updateIncome = (id, data) => api.put(`/records/income/${id}`, data)
export const deleteIncome = (id) => api.delete(`/records/income/${id}`)

// ── Expenses — backend uses MultiPartParser, must send FormData ──
export const getExpenses = () => api.get('/records/expenses')

export const createExpense = (data) => {
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) form.append(k, v)
  })
  return api.post('/records/expenses', form)
}

export const updateExpense = (id, data) => {
  const form = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) form.append(k, v)
  })
  return api.put(`/records/expenses/${id}`, form)
}

export const deleteExpense = (id) => api.delete(`/records/expenses/${id}`)

// ── Budgets ──────────────────────────────────────────
export const getBudgets = () => api.get('/records/budgets')
export const createBudget = (data) => api.post('/records/budgets', data)
export const deleteBudget = (id) => api.delete(`/records/budgets/${id}`)

// ── Sources & Categories ─────────────────────────────
export const getSources = () => api.get('/records/sources')
export const getCategories = () => api.get('/records/categories')

// ── Analytics ────────────────────────────────────────
export const getAnalyticsSummary = () => api.get('/analytics/summary/')
export const getAnalyticsInsights = () => api.get('/analytics/insights/')
export const getMonthlyTrends = () => api.get('/analytics/monthly-trends/')
