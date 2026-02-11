import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import AppLayout from '../src/components/layout/AppLayout'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}))

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

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})

afterEach(() => {
  cleanup()
})

describe('AppLayout', () => {
  it('renders header with title', () => {
    render(<AppLayout />)
    expect(screen.getByText('OneVizn Portal')).toBeInTheDocument()
  })

  it('renders outlet', () => {
    render(<AppLayout />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('loads sidebar state from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('true')
    render(<AppLayout />)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('sidebarCollapsed')
  })

  it('toggles sidebar collapse and saves to localStorage', () => {
    render(<AppLayout />)
    const toggleButton = screen.getByRole('button', { name: /collapse|expand/i })
    fireEvent.click(toggleButton)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebarCollapsed', 'true')
  })

  it('renders navigation items', () => {
    render(<AppLayout />)
    expect(screen.getAllByText('Dashboard')).toHaveLength(2)
    expect(screen.getAllByText('Analytics')).toHaveLength(2)
    expect(screen.getAllByText('Users')).toHaveLength(2)
    expect(screen.getAllByText('Settings')).toHaveLength(2)
  })
})
