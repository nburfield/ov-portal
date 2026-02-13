import api from './api.js'

export const getAll = async (params = {}, options = {}) => {
  const response = await api.get('/api/v2/workorders', { params, ...options })
  return response.data
}

export const getByKey = async (key) => {
  const response = await api.get(`/api/v2/workorders/${key}`)
  return response.data
}

export const create = async (data) => {
  const response = await api.post('/api/v2/workorders', data)
  return response.data
}

export const update = async (key, data) => {
  const response = await api.put(`/api/v2/workorders/${key}`, data)
  return response.data
}

export const remove = async (key) => {
  await api.delete(`/api/v2/workorders/${key}`)
}

export const workorderService = {
  getAll,
  getByKey,
  create,
  update,
  remove,
}
