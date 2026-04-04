import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/" replace />

  if (allowedRoles) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />
    } catch {
      return <Navigate to="/" replace />
    }
  }

  return children
}
