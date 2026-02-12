import api from './api.js'

const getHealth = async () => {
  const response = await api.get('/api/v1/health')
  return response.data
}

const getQueueDepths = async () => {
  const response = await api.get('/api/v1/health/queues')
  return response.data
}

const getRecentErrors = async () => {
  const response = await api.get('/api/v1/health/errors')
  return response.data
}

const getStats = async () => {
  const response = await api.get('/api/v1/health/stats')
  return response.data
}

export const healthService = {
  getHealth,
  getQueueDepths,
  getRecentErrors,
  getStats,
}
