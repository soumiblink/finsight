import api from './axios'

export const getAnalyticsSummary  = () => api.get('/analytics/summary/')
export const getAnalyticsInsights = () => api.get('/analytics/insights/')
export const getMonthlyTrends     = () => api.get('/analytics/monthly-trends/')
export const getDashboard         = () => api.get('/analytics/dashboard/')
