import api from './api.js'

export const getAll = async (params = {}) => {
  const response = await api.get('/api/v2/userservices', { params })
  return response.data
}

const getByKey = async (key) => {
  const response = await api.get(`/api/v2/userservices/${key}`)
  return response.data
}

const create = async (data) => {
  const response = await api.post('/api/v2/userservices', data)
  return response.data
}

const update = async (key, data) => {
  const response = await api.put(`/api/v2/userservices/${key}`, data)
  return response.data
}

const remove = async (key) => {
  await api.delete(`/api/v2/userservices/${key}`)
}

export const userserviceService = {
  getAll,
  getByKey,
  create,
  update,
  remove,
}
