import api from './axios'

// POST /api/users/auth/login/
export const loginRequest = (credentials) =>
  api.post('/users/auth/login/', credentials)

// POST /api/users/auth/register/
export const registerRequest = (data) =>
  api.post('/users/auth/register/', data)
