import api from './api.js'

const getAll = async (params = {}) => {
  const response = await api.get('/api/v2/maintenancerecords', { params })
  return response.data
}

const getByKey = async (key) => {
  const response = await api.get(`/api/v2/maintenancerecords/${key}`)
  return response.data
}

const create = async (data) => {
  const response = await api.post('/api/v2/maintenancerecords', data)
  return response.data
}

const update = async (key, data) => {
  const response = await api.put(`/api/v2/maintenancerecords/${key}`, data)
  return response.data
}

const remove = async (key) => {
  await api.delete(`/api/v2/maintenancerecords/${key}`)
}

export const maintenancerecordService = {
  getAll,
  getByKey,
  create,
  update,
  remove,
}
