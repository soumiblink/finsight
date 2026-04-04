import api from './axios'

export const getUsers      = ()           => api.get('/users/')
export const updateRole    = (id, role)   => api.patch(`/users/${id}/role/`,   { role })
export const updateStatus  = (id, active) => api.patch(`/users/${id}/status/`, { is_active: active })
