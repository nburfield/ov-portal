import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { BusinessProvider } from '../src/contexts/BusinessContext'
import { useBusiness } from '../src/hooks/useBusiness'
import businessService from '../src/services/business.service'
import { useAuth } from '../src/hooks/useAuth'

// Mock the business service
vi.mock('../src/services/business.service', () => ({
  default: {
    getBusinesses: vi.fn(),
  },
}))

// Mock useAuth
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

function TestComponent() {
  const {
    activeBusiness,
    businesses,
    roles,
    isLoading,
    switchBusiness,
    refreshBusinesses,
    getCurrentRoles,
  } = useBusiness()

  return (
    <div>
      <div data-testid="activeBusiness">
        {activeBusiness ? JSON.stringify(activeBusiness) : 'null'}
      </div>
      <div data-testid="businesses">{JSON.stringify(businesses)}</div>
      <div data-testid="roles">{JSON.stringify(roles)}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button data-testid="switchBusiness" onClick={() => switchBusiness('business1')}>
        Switch
      </button>
      <button data-testid="refreshBusinesses" onClick={refreshBusinesses}>
        Refresh
      </button>
      <div data-testid="currentRoles">{JSON.stringify(getCurrentRoles())}</div>
    </div>
  )
}

function renderWithProviders() {
  return render(
    <BusinessProvider>
      <TestComponent />
    </BusinessProvider>
  )
}

describe('BusinessContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock for useAuth
    useAuth.mockReturnValue({
      isAuthenticated: true,
      userRoles: { business1: ['owner'], business2: ['manager'] },
    })
    businessService.getBusinesses.mockResolvedValue([
      { business_key: 'business1', name: 'Business 1', type: 'type1' },
      { business_key: 'business2', name: 'Business 2', type: 'type2' },
    ])
  })

  afterEach(() => {
    cleanup()
  })

  it('renders and fetches businesses on mount', async () => {
    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByTestId('activeBusiness').textContent).toBe('null')
      expect(screen.getByTestId('businesses').textContent).toBe(
        '[{"business_key":"business1","name":"Business 1","type":"type1"},{"business_key":"business2","name":"Business 2","type":"type2"}]'
      )
      expect(screen.getByTestId('roles').textContent).toBe(
        '{"business1":["owner"],"business2":["manager"]}'
      )
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    })
  })

  it('fetches businesses on mount when authenticated', async () => {
    renderWithProviders()

    await waitFor(() => {
      expect(businessService.getBusinesses).toHaveBeenCalled()
      expect(screen.getByTestId('businesses').textContent).toBe(
        '[{"business_key":"business1","name":"Business 1","type":"type1"},{"business_key":"business2","name":"Business 2","type":"type2"}]'
      )
      expect(screen.getByTestId('roles').textContent).toBe(
        '{"business1":["owner"],"business2":["manager"]}'
      )
    })
  })

  it('auto-selects business if only one', async () => {
    businessService.getBusinesses.mockResolvedValue([
      { business_key: 'business1', name: 'Business 1', type: 'type1' },
    ])

    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByTestId('activeBusiness').textContent).toBe(
        '{"business_key":"business1","name":"Business 1","type":"type1"}'
      )
    })
  })

  it('switches active business', async () => {
    renderWithProviders()

    await waitFor(() => {
      expect(businessService.getBusinesses).toHaveBeenCalled()
    })

    const switchButton = screen.getByTestId('switchBusiness')
    switchButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('activeBusiness').textContent).toBe(
        '{"business_key":"business1","name":"Business 1","type":"type1"}'
      )
    })
  })

  it('returns current roles for active business', async () => {
    renderWithProviders()

    await waitFor(() => {
      expect(businessService.getBusinesses).toHaveBeenCalled()
    })

    // Switch to business1
    const switchButton = screen.getByTestId('switchBusiness')
    switchButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('currentRoles').textContent).toBe('["owner"]')
    })
  })

  it('handles unauthenticated state', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      userRoles: {},
    })

    renderWithProviders()

    await waitFor(() => {
      expect(businessService.getBusinesses).not.toHaveBeenCalled()
      expect(screen.getByTestId('activeBusiness').textContent).toBe('null')
      expect(screen.getByTestId('businesses').textContent).toBe('[]')
      expect(screen.getByTestId('roles').textContent).toBe('{}')
    })
  })
})
