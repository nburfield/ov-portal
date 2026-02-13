import { createContext, useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import businessService from '../services/business.service.js'
import ROUTES from '../constants/routes.js'

const BusinessContext = createContext()

export { BusinessContext }

export function BusinessProvider({ children }) {
  const { isAuthenticated, userRoles } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [state, setState] = useState({
    activeBusiness: null,
    businesses: [],
    roles: {},
    isLoading: false,
  })

  const switchBusiness = useCallback(
    (business_key) => {
      const business = state.businesses.find((b) => b.business_key === business_key)
      if (business) {
        setState((prev) => ({
          ...prev,
          activeBusiness: business,
        }))
      }
    },
    [state.businesses]
  )

  const refreshBusinesses = useCallback(async () => {
    if (!isAuthenticated) {
      setState({
        activeBusiness: null,
        businesses: [],
        roles: {},
        isLoading: false,
      })
      return
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }))
      const response = await businessService.getBusinesses()
      let businesses = []

      if (Array.isArray(response)) {
        businesses = response
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.values)) {
          businesses = response.values
        } else if (Array.isArray(response.data?.values)) {
          businesses = response.data.values
        } else if (Array.isArray(response.data)) {
          businesses = response.data
        } else if (Array.isArray(response.businesses)) {
          businesses = response.businesses
        } else if (Array.isArray(response.results)) {
          businesses = response.results
        }
      }

      console.debug('Businesses response:', { response, businesses })

      const rolesByBusiness = Array.isArray(userRoles)
        ? businesses.reduce((acc, business) => {
            acc[business.business_key] = userRoles
            return acc
          }, {})
        : userRoles

      setState((prev) => {
        let activeBusiness = prev.activeBusiness
        if (businesses.length === 1 && !activeBusiness) {
          activeBusiness = businesses[0]
        }

        return {
          activeBusiness,
          businesses,
          roles: rolesByBusiness,
          isLoading: false,
        }
      })

      if (businesses.length === 0) {
        console.log('[BusinessContext] No businesses found, redirecting to CREATE_BUSINESS')
        console.log('[BusinessContext] API Response:', response)
        console.log('[BusinessContext] Response.data:', response.data)
        console.log(
          '[BusinessContext] Response.data type:',
          typeof response.data,
          Array.isArray(response.data)
        )
        console.log('[BusinessContext] Parsed businesses:', businesses)
        if (location.pathname !== ROUTES.CREATE_BUSINESS) {
          navigate(ROUTES.CREATE_BUSINESS, { replace: true })
        }
      } else {
        console.log('[BusinessContext] Businesses found:', businesses.length, businesses)
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [isAuthenticated, userRoles, navigate, location.pathname])

  const getCurrentRoles = useCallback(() => {
    if (!state.activeBusiness) return []
    return state.roles[state.activeBusiness.business_key] || []
  }, [state.activeBusiness, state.roles])

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      refreshBusinesses()
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [refreshBusinesses])

  const value = {
    ...state,
    switchBusiness,
    refreshBusinesses,
    getCurrentRoles,
  }

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export default BusinessProvider
