import { createContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/auth.service.js'
import { setAuthToken, setOnUnauthorized } from '../services/api.js'
import ROUTES from '../constants/routes.js'

const AuthContext = createContext()

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function decodeJwt(token) {
  try {
    if (!token || typeof token !== 'string') return {}
    const parts = token.split('.')
    if (parts.length !== 3) return {}
    return JSON.parse(atob(parts[1]))
  } catch {
    return {}
  }
}

function extractRolesFromJwt(token) {
  const payload = decodeJwt(token)
  return payload.roles || []
}

function userFromJwt(token, existingUser = null) {
  const payload = decodeJwt(token)
  if (!payload || !payload.user_name) return existingUser
  return {
    ...(existingUser || {}),
    user_name: payload.user_name,
    email: payload.email ?? existingUser?.email,
  }
}

let refreshTimeoutId = null

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [state, setState] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = localStorage.getItem(USER_KEY)

    let parsedUser = null
    const userRoles = token ? extractRolesFromJwt(token) : []

    try {
      if (user && user !== 'undefined') {
        parsedUser = JSON.parse(user)
      }
    } catch {
      console.error('Failed to parse user from localStorage')
    }

    const userWithJwt = token ? userFromJwt(token, parsedUser) : parsedUser
    return {
      token: token,
      user: userWithJwt,
      isAuthenticated: !!token,
      isLoading: false,
      userRoles: userRoles,
    }
  })

  // Use refs to break circular dependencies
  const refreshRef = useRef(null)
  const logoutRef = useRef(null)

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
              if (refreshRef.current) {
                await refreshRef.current()
              }
            } catch (error) {
              console.error('Token refresh failed:', error)
              if (logoutRef.current) {
                logoutRef.current()
              }
            }
          }, refreshTime)
        }
      } catch (error) {
        console.error('Failed to parse token for refresh scheduling:', error)
      }
    },
    [clearRefreshTimeout]
  )

  const register = useCallback(
    async (userData) => {
      try {
        await authService.register(userData)

        const response = await authService.login({
          user_name: userData.user_name,
          password: userData.password,
        })

        const { token, user } = response
        const userRoles = extractRolesFromJwt(token)
        const userWithJwt = userFromJwt(token, user)

        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(userWithJwt))

        setState({
          token,
          user: userWithJwt,
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

  const login = useCallback(
    async (credentials) => {
      try {
        const response = await authService.login(credentials)

        const { token, user } = response
        const userRoles = extractRolesFromJwt(token)
        const userWithJwt = userFromJwt(token, user)

        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(userWithJwt))

        setState({
          token,
          user: userWithJwt,
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
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        userRoles: [],
      })
      navigate(ROUTES.LOGIN)
    }
  }, [state.token, navigate, clearRefreshTimeout])

  const refresh = useCallback(async () => {
    try {
      const response = await authService.refresh()
      const { token } = response

      localStorage.setItem(TOKEN_KEY, token)

      setState((prev) => {
        const userWithJwt = userFromJwt(token, prev.user)
        if (userWithJwt) {
          localStorage.setItem(USER_KEY, JSON.stringify(userWithJwt))
        }
        return {
          ...prev,
          token,
          user: userWithJwt ?? prev.user,
        }
      })

      scheduleTokenRefresh(token)
    } catch (error) {
      console.error('Token refresh failed:', error)
      if (logoutRef.current) {
        logoutRef.current()
      }
      throw error
    }
  }, [scheduleTokenRefresh])

  // Update refs after functions are defined
  useEffect(() => {
    refreshRef.current = refresh
    logoutRef.current = logout
  }, [refresh, logout])

  const updateProfile = useCallback(async (updatedUser) => {
    setState((prev) => ({
      ...prev,
      user: updatedUser,
    }))
  }, [])

  const handleUnauthorized = useCallback(() => {
    logout()
  }, [logout]) // logout is correctly included in dependencies

  // Wire up API interceptors
  useEffect(() => {
    setAuthToken(() => state.token)
    setOnUnauthorized(handleUnauthorized)
  }, [state.token, handleUnauthorized])

  const value = {
    ...state,
    login,
    register,
    logout,
    refresh,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
