import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../src/contexts/AuthContext'
import { BusinessProvider } from '../src/contexts/BusinessContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import AppLayout from '../src/components/layout/AppLayout'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  }
})

// Mock auth service
vi.mock('../src/services/auth.service.js', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    updateProfile: vi.fn(),
    getUserRoles: vi.fn().mockResolvedValue({}),
  },
}))

// Mock business service
vi.mock('../src/services/business.service.js', () => ({
  default: {
    getBusinesses: vi.fn().mockResolvedValue([]),
  },
}))

// Mock useAuth
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { firstName: 'Test', lastName: 'User' },
    logout: vi.fn(),
  })),
}))

// Mock useBusiness
vi.mock('../src/hooks/useBusiness', () => ({
  useBusiness: vi.fn(() => ({
    businesses: [],
    activeBusiness: null,
    roles: {},
    getCurrentRoles: vi.fn(() => ['manager']),
  })),
}))

// Mock useTheme
vi.mock('../src/contexts/ThemeContext', async () => {
  const actual = await vi.importActual('../src/contexts/ThemeContext')
  return {
    ...actual,
    useTheme: vi.fn(() => ({
      isDark: false,
      toggleTheme: vi.fn(),
    })),
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})

afterEach(() => {
  cleanup()
})

const renderAppLayout = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <ThemeProvider>
            <AppLayout />
          </ThemeProvider>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )

describe('AppLayout', () => {
  it('renders header with title', () => {
    renderAppLayout()
    expect(screen.getByText('OneVizn')).toBeInTheDocument()
  })

  it('renders outlet', () => {
    renderAppLayout()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('loads sidebar state from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('true')
    renderAppLayout()
    expect(localStorageMock.getItem).toHaveBeenCalledWith('sidebarCollapsed')
  })

  it('toggles sidebar collapse and saves to localStorage', () => {
    renderAppLayout()
    const toggleButton = screen.getByRole('button', { name: /collapse|expand/i })
    fireEvent.click(toggleButton)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebarCollapsed', 'true')
  })

  it('renders sidebar with navigation groups', () => {
    renderAppLayout()
    // Check for group headers when not collapsed
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
  })
})
