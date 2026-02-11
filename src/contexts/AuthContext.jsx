import { createContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/auth.service.js'
import { setAuthToken, setOnUnauthorized } from '../services/api.js'
import ROUTES from '../constants/routes.js'

const AuthContext = createContext()

let refreshTimeoutId = null

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [state, setState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    userRoles: {}, // { business_key: role[] }
  })

  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId)
      refreshTimeoutId = null
    }
  }, [])

  const scheduleTokenRefresh = useCallback(
    (token) => {
      clearRefreshTimeout()
      // Assuming JWT has exp claim, decode and schedule refresh 5 minutes before expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000 // Convert to milliseconds
        const now = Date.now()
        const refreshTime = exp - now - 5 * 60 * 1000 // 5 minutes before expiry

        if (refreshTime > 0) {
          refreshTimeoutId = setTimeout(async () => {
            try {
              await refresh()
            } catch (error) {
              console.error('Token refresh failed:', error)
              logout()
            }
          }, refreshTime)
        }
      } catch (error) {
        console.error('Failed to parse token for refresh scheduling:', error)
      }
    },
    [clearRefreshTimeout]
  )

  const login = useCallback(
    async (credentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))
        const response = await authService.login(credentials)

        const { token, user } = response
        const userRoles = await authService.getUserRoles()

        setState({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          userRoles,
        })

        scheduleTokenRefresh(token)
        navigate(ROUTES.DASHBOARD)
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }))
        throw error
      }
    },
    [navigate, scheduleTokenRefresh]
  )

  const logout = useCallback(async () => {
    try {
      if (state.token) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      clearRefreshTimeout()
      setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        userRoles: {},
      })
      navigate(ROUTES.LOGIN)
    }
  }, [state.token, navigate, clearRefreshTimeout])

  const refresh = useCallback(async () => {
    try {
      const response = await authService.refresh()
      const { token } = response

      setState((prev) => ({
        ...prev,
        token,
      }))

      scheduleTokenRefresh(token)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }, [logout, scheduleTokenRefresh])

  const updateProfile = useCallback(async (data) => {
    const updatedUser = await authService.updateProfile(data)
    setState((prev) => ({
      ...prev,
      user: updatedUser,
    }))
  }, [])

  const handleUnauthorized = useCallback(() => {
    logout()
  }, [])

  // Wire up API interceptors
  useEffect(() => {
    setAuthToken(() => state.token)
    setOnUnauthorized(handleUnauthorized)
  }, [state.token, handleUnauthorized])

  // Initialize auth state on mount (check for existing token, but since we store in memory, this would be empty)
  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: false }))
  }, [])

  const value = {
    ...state,
    login,
    logout,
    refresh,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
