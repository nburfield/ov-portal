import api from './api.js'

export async function login({ user_name, password }) {
  const response = await api.post(
    '/api/v2/auth/login',
    { user_name, password },
    {
      skipAuthRedirect: true, // 401 = bad credentials; let the page show the error
    }
  )
  return response.data
}

export async function register({ user_name, password, first_name, last_name, email, phone }) {
  const response = await api.post(
    '/api/v2/auth/register',
    {
      user_name,
      password,
      first_name,
      last_name,
      email,
      phone,
    },
    {
      skipAuthRedirect: true, // 4xx = validation/conflict; let the page show the error
    }
  )
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

export async function changePassword({ current_password, new_password }) {
  const response = await api.post('/api/v2/auth/change-password', {
    current_password,
    new_password,
  })
  return response.data
}

// Default export for convenience
const authService = {
  login,
  register,
  refresh,
  logout,
  changePassword,
}

export default authService
