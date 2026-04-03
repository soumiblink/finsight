import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({ baseURL: BASE_URL })

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Token refresh logic ───────────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []  // requests that arrived while refresh was in progress

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/users/auth/token/refresh/')
    ) {
      const refreshToken = localStorage.getItem('refresh_token')

      // No refresh token stored — log out immediately
      if (!refreshToken) {
        clearAndRedirect()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(`${BASE_URL}/users/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const newAccess = res.data.access
        localStorage.setItem('access_token', newAccess)
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`

        processQueue(null, newAccess)

        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function clearAndRedirect() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/'
}

export default api
