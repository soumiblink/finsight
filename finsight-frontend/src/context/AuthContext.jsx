import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest, registerRequest } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const login = async (username, password) => {
    setError(null)
    try {
      const res = await loginRequest({ username, password })
      const { access, refresh } = res.data
      localStorage.setItem('access_token', access)
      if (refresh) localStorage.setItem('refresh_token', refresh)
      const userData = res.data.user ?? { username }
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed. Check your credentials.'
      setError(msg)
      console.error('Login error:', err)
    }
  }

  const register = async (username, password, role = 'viewer') => {
    setError(null)
    try {
      await registerRequest({ username, password, role })
      // auto-login after successful registration
      await login(username, password)
    } catch (err) {
      const data = err.response?.data
      const msg =
        data?.username?.[0] ||
        data?.password?.[0] ||
        data?.error ||
        data?.detail ||
        'Registration failed.'
      setError(msg)
      console.error('Register error:', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
