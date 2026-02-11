import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../src/contexts/AuthContext'
import { useAuth } from '../src/hooks/useAuth'
import { setAuthToken, setOnUnauthorized } from '../src/services/api'
import authService from '../src/services/auth.service'

// Mock the API functions
vi.mock('../src/services/api', () => ({
  setAuthToken: vi.fn(),
  setOnUnauthorized: vi.fn(),
}))

vi.mock('../src/services/auth.service', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getUserRoles: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  }
})

function TestComponent() {
  const {
    token,
    user,
    isAuthenticated,
    isLoading,
    userRoles,
    login,
    logout,
    refresh,
    updateProfile,
  } = useAuth()

  return (
    <div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="userRoles">{JSON.stringify(userRoles)}</div>
      <button
        onClick={() => login({ email: 'test@test.com', password: 'password' })}
        data-testid="login-btn"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={refresh} data-testid="refresh-btn">
        Refresh
      </button>
      <button onClick={() => updateProfile({ first_name: 'John' })} data-testid="update-btn">
        Update Profile
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('should initialize with default state', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('isLoading').textContent).toBe('false')
    expect(screen.getByTestId('userRoles').textContent).toBe('{}')
  })

  it('should wire up API interceptors on mount', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(setAuthToken).toHaveBeenCalled()
    expect(setOnUnauthorized).toHaveBeenCalled()
  })

  it('should handle successful login', async () => {
    const mockUser = {
      user_key: 'user123',
      user_name: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@test.com',
    }
    const mockToken = 'jwt.token.here'
    const mockRoles = { business1: ['manager'] }

    authService.login.mockResolvedValue({ token: mockToken, user: mockUser })
    authService.getUserRoles.mockResolvedValue(mockRoles)

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    const loginButton = screen.getByTestId('login-btn')
    loginButton.click()

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password',
      })
      expect(authService.getUserRoles).toHaveBeenCalled()
      expect(screen.getByTestId('token').textContent).toBe(mockToken)
      expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser))
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
      expect(screen.getByTestId('userRoles').textContent).toBe(JSON.stringify(mockRoles))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials')
    authService.login.mockRejectedValue(mockError)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    const loginButton = screen.getByTestId('login-btn')
    loginButton.click()

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled()
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('should handle logout', async () => {
    // First set authenticated state
    authService.login.mockResolvedValue({
      token: 'token',
      user: {
        user_key: '1',
        user_name: 'user',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.com',
      },
    })
    authService.getUserRoles.mockResolvedValue({})
    authService.logout.mockResolvedValue({})

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    // Login first
    const loginButton = screen.getByTestId('login-btn')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })

    // Now logout
    const logoutButton = screen.getByTestId('logout-btn')
    logoutButton.click()

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled()
      expect(screen.getByTestId('token').textContent).toBe('null')
      expect(screen.getByTestId('user').textContent).toBe('null')
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('should handle profile update', async () => {
    const updatedUser = {
      user_key: 'user123',
      user_name: 'testuser',
      first_name: 'John',
      last_name: 'User',
      email: 'test@test.com',
    }

    authService.updateProfile.mockResolvedValue(updatedUser)

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    const updateButton = screen.getByTestId('update-btn')
    updateButton.click()

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({ first_name: 'John' })
    })
  })

  it('should throw error when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
