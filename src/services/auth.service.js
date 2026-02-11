import api from './api.js'

export const authService = {
  async login(credentials) {
    const response = await api.post('/api/v2/auth/login', credentials)
    return response.data
  },

  async logout() {
    const response = await api.post('/api/v2/auth/logout')
    return response.data
  },

  async refresh() {
    const response = await api.post('/api/v2/auth/refresh')
    return response.data
  },

  async getUserRoles() {
    const response = await api.get('/api/v2/auth/roles')
    return response.data // Expected: { business_key: role[] } mappings
  },

  async updateProfile(data) {
    const response = await api.put('/api/v2/auth/profile', data)
    return response.data
  },
}

export default authService
