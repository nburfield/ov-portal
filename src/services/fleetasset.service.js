import api from './api.js'

export const getAll = async (params = {}) => {
  const response = await api.get('/api/v2/fleetassets', { params })
  return response.data
}

export const getByKey = async (key) => {
  const response = await api.get(`/api/v2/fleetassets/${key}`)
  return response.data
}

export const create = async (data) => {
  const response = await api.post('/api/v2/fleetassets', data)
  return response.data
}

export const update = async (key, data) => {
  const response = await api.put(`/api/v2/fleetassets/${key}`, data)
  return response.data
}

export const remove = async (key) => {
  await api.delete(`/api/v2/fleetassets/${key}`)
}
