import axios from 'axios'
import { toast } from 'react-toastify'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
})

let getToken = null
let onUnauthorized = null

export const setAuthToken = (callback) => {
  getToken = callback
}

export const setOnUnauthorized = (callback) => {
  onUnauthorized = callback
}

api.interceptors.request.use(
  (config) => {
    if (getToken) {
      config.headers.Authorization = `Bearer ${getToken()}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        if (onUnauthorized) onUnauthorized()
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action")
      } else if (status === 400) {
        return Promise.reject({ ...error, validationErrors: data.errors || data })
      } else if (status === 409) {
        return Promise.reject({ ...error, conflictDetails: data.message || data })
      } else if (status === 500) {
        toast.error('Something went wrong. Please try again.')
      }
    } else if (error.request) {
      toast.error('Unable to connect to server. Check your connection.')
    }
    return Promise.reject(error)
  }
)

export default api
