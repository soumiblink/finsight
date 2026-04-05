import api from './axios'


export const createIncome = (data)    => api.post('/records/income', data)
export const updateIncome = (id, data)=> api.put(`/records/income/${id}`, data)
export const deleteIncome = (id)      => api.delete(`/records/income/${id}`)


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


export const getBudgets    = ()         => api.get('/records/budgets')
export const createBudget  = (data)     => api.post('/records/budgets', data)
export const updateBudget  = (id, data) => api.put(`/records/budgets/${id}`, data)
export const deleteBudget  = (id)       => api.delete(`/records/budgets/${id}`)


export const getSources    = ()         => api.get('/records/sources')
export const getCategories = ()         => api.get('/records/categories')
