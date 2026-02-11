import api from './api.js'

export const getPhotosByLocation = async (locationKey) => {
  const response = await api.get(`/api/v2/locations/${locationKey}/photos`)
  return response.data
}

export const uploadPhoto = async (locationKey, photoData, file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('taken_at', photoData.taken_at)
  formData.append('note', photoData.note)

  const response = await api.post(`/api/v2/locations/${locationKey}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getPhotoUrl = async (locationKey, photoKey) => {
  const response = await api.get(`/api/v2/locations/${locationKey}/photos/${photoKey}/url`)
  return response.data.url
}
