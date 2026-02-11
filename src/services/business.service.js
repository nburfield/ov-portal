import api from './api.js'

export const businessService = {
  async getBusinesses() {
    const response = await api.get('/api/v2/businesses')
    return response.data // Expected: [{ business_key, name, type }, ...]
  },
}

export default businessService
