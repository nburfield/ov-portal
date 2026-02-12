import api from './api.js'

export const getAll = async (params = {}) => {
  const response = await api.get('/api/v2/customers', { params })
  return response.data
}

export const getByKey = async (key) => {
  const response = await api.get(`/api/v2/customers/${key}`)
  return response.data
}

export const create = async (data) => {
  const response = await api.post('/api/v2/customers', data)
  return response.data
}

export const update = async (key, data) => {
  const response = await api.put(`/api/v2/customers/${key}`, data)
  return response.data
}

export const remove = async (key) => {
  await api.delete(`/api/v2/customers/${key}`)
}

// Contacts
export const getContacts = async (customerKey) => {
  const response = await api.get(`/api/v2/customers/${customerKey}/contacts`)
  return response.data
}

export const createContact = async (customerKey, data) => {
  const response = await api.post(`/api/v2/customers/${customerKey}/contacts`, data)
  return response.data
}

// Contracts
export const getContracts = async (customerKey) => {
  const response = await api.get(`/api/v2/customers/${customerKey}/contracts`)
  return response.data
}

export const createContract = async (customerKey, data) => {
  const response = await api.post(`/api/v2/customers/${customerKey}/contracts`, data)
  return response.data
}

export const uploadContract = async (customerKey, contractKey, file) => {
  const response = await api.get(`/api/v2/customers/${customerKey}/contracts/${contractKey}/upload`)
  const { put_url } = response.data
  // Upload to S3
  await fetch(put_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })
}

export const getContractUrl = async (customerKey, contractKey) => {
  const response = await api.get(`/api/v2/customers/${customerKey}/contracts/${contractKey}/url`)
  return response.data.get_url
}

// Default export for convenience
const customerService = {
  getAll,
  getByKey,
  create,
  update,
  remove,
  getContacts,
  createContact,
  getContracts,
  createContract,
  uploadContract,
  getContractUrl,
}

export { customerService }
export default customerService
