import api from './api.js'

export const getAll = async (params = {}) => {
  const response = await api.get('/api/v2/businesses', { params })
  return response.data
}

export const getByKey = async (key) => {
  const response = await api.get(`/api/v2/businesses/${key}`)
  return response.data
}

export const create = async (data) => {
  const response = await api.post('/api/v2/businesses', data)
  return response.data
}

export const update = async (key, data) => {
  const response = await api.put(`/api/v2/businesses/${key}`, data)
  return response.data
}

export const remove = async (key) => {
  await api.delete(`/api/v2/businesses/${key}`)
}

// Contracts
export const getContracts = async (businessKey) => {
  const response = await api.get(`/api/v2/businesses/${businessKey}/contracts`)
  return response.data
}

export const addContract = async (businessKey, data) => {
  const response = await api.post(`/api/v2/businesses/${businessKey}/contracts`, data)
  return response.data
}

export const removeContract = async (businessKey, contractKey) => {
  await api.delete(`/api/v2/businesses/${businessKey}/contracts/${contractKey}`)
}

export const uploadContract = async (businessKey, contractKey, file) => {
  const response = await api.get(
    `/api/v2/businesses/${businessKey}/contracts/${contractKey}/upload`
  )
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

// Subcontractors
export const getSubcontractors = async (businessKey) => {
  const response = await api.get(`/api/v2/businesses/${businessKey}/subcontractors`)
  return response.data
}

export const addSubcontractor = async (businessKey, subcontractorKey) => {
  const response = await api.post(`/api/v2/businesses/${businessKey}/subcontractors`, {
    subcontractor_key: subcontractorKey,
  })
  return response.data
}

export const removeSubcontractor = async (businessKey, subcontractorKey) => {
  await api.delete(`/api/v2/businesses/${businessKey}/subcontractors/${subcontractorKey}`)
}

// Parents
export const getParents = async (businessKey) => {
  const response = await api.get(`/api/v2/businesses/${businessKey}/parents`)
  return response.data
}

// Default export for convenience
const businessService = {
  getAll,
  getBusinesses: getAll, // Alias for getAll for backward compatibility
  getByKey,
  create,
  update,
  remove,
  getContracts,
  addContract,
  removeContract,
  uploadContract,
  getSubcontractors,
  addSubcontractor,
  removeSubcontractor,
  getParents,
}

export { businessService }
export default businessService
