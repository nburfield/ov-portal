import api from './api.js'

export const getHealth = async () => {
  const response = await api.get('/api/v1/health')
  return response.data
}

export const getQueueDepths = async () => {
  const response = await api.get('/api/v1/health/queues')
  return response.data
}

export const getRecentErrors = async () => {
  const response = await api.get('/api/v1/health/errors')
  return response.data
}

export const getStats = async () => {
  const response = await api.get('/api/v1/health/stats')
  return response.data
}
