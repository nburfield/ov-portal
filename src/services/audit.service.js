import api from './api.js'

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/api/v2/audit-logs', { params })
  return response.data
}
