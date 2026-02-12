import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import LoginPage from '../src/pages/auth/LoginPage'

// Mock the auth service
vi.mock('../src/services/auth.service', () => ({
  default: {
    login: vi.fn(),
    getUserRoles: vi.fn(),
  },
}))

const renderLoginPage = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all required elements', () => {
    renderLoginPage()

    expect(screen.getByText('OneVizn')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Username *')).toBeInTheDocument()
    expect(screen.getByLabelText('Password *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
  })

  it('shows password toggle button', () => {
    renderLoginPage()

    const passwordInput = screen.getByLabelText('Password *')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('displays validation errors for empty fields', async () => {
    renderLoginPage()

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('calls login on successful form submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue({})
    const authService = await import('../src/services/auth.service')
    authService.default.login = mockLogin
    authService.default.getUserRoles = vi.fn().mockResolvedValue({})

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Username *'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'password123' },
    })

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        user_name: 'testuser',
        password: 'password123',
      })
    })
  })

  it('displays error message on login failure', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })
    const authService = await import('../src/services/auth.service')
    authService.default.login = mockLogin

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Username *'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'wrongpassword' },
    })

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('displays generic error message on 401 status code', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { status: 401, data: { message: 'Unauthorized' } },
    })
    const authService = await import('../src/services/auth.service')
    authService.default.login = mockLogin

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Username *'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'wrongpassword' },
    })

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please check your credentials.')).toBeInTheDocument()
    })
  })

  it('forgot password button shows placeholder', () => {
    renderLoginPage()

    const forgotButton = screen.getByText('Forgot your password?')
    expect(forgotButton.tagName).toBe('BUTTON')
  })

  it('register link points to correct route', () => {
    renderLoginPage()

    const registerLink = screen.getByText('Register')
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})
