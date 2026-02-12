import { createContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import businessService from '../services/business.service.js'

const BusinessContext = createContext()

export function BusinessProvider({ children }) {
  const { isAuthenticated, userRoles } = useAuth()

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
      const businesses = await businessService.getBusinesses()

      setState((prev) => {
        let activeBusiness = prev.activeBusiness
        // Auto-select if only one business and no current selection
        if (businesses.length === 1 && !activeBusiness) {
          activeBusiness = businesses[0]
        }

        return {
          activeBusiness,
          businesses,
          roles: userRoles,
          isLoading: false,
        }
      })
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [isAuthenticated, userRoles])

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

export default BusinessContext
