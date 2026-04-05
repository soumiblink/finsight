import api from './axios'


export const loginRequest = (credentials) =>
  api.post('/users/auth/login/', credentials)


export const registerRequest = (data) =>
  api.post('/users/auth/register/', data)


export const getMeRequest = () => api.get('/users/me/')
