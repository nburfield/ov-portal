import api from './api.js'

export async function login({ user_name, password }) {
  const response = await api.post('/api/v2/auth/login', { user_name, password })
  return response.data
}

export async function register({ user_name, password, first_name, last_name, email, phone }) {
  const response = await api.post('/api/v2/auth/register', {
    user_name,
    password,
    first_name,
    last_name,
    email,
    phone,
  })
  return response.data
}

export async function refresh() {
  const response = await api.post('/api/v2/auth/refresh')
  return response.data
}

export async function logout() {
  const response = await api.post('/api/v2/auth/logout')
  return response.data
}
