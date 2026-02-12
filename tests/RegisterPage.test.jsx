import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import RegisterPage from '../src/pages/auth/RegisterPage'

vi.mock('../src/services/auth.service', () => ({
  default: {
    register: vi.fn(),
    login: vi.fn(),
    getUserRoles: vi.fn(),
  },
}))

const renderRegisterPage = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form with all required elements', () => {
    renderRegisterPage()

    expect(screen.getByText('OneVizn')).toBeInTheDocument()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Username *')).toBeInTheDocument()
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument()
    expect(screen.getByLabelText('Password *')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('displays error message from API on 400 status code failure', async () => {
    const mockRegister = vi.fn().mockRejectedValue({
      response: { status: 400, data: { message: 'Username already exists' } },
    })
    const authService = await import('../src/services/auth.service')
    authService.default.register = mockRegister

    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Username *'), {
      target: { value: 'existinguser' },
    })
    fireEvent.change(screen.getByLabelText('First Name *'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText('Last Name *'), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Phone *'), {
      target: { value: '1234567890' },
    })
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password *'), {
      target: { value: 'Password123!' },
    })

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument()
    })
  })

  it('displays field-level errors from API', async () => {
    const mockRegister = vi.fn().mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: {
            email: 'Email already registered',
            phone: 'Phone number is invalid',
          },
        },
      },
    })
    const authService = await import('../src/services/auth.service')
    authService.default.register = mockRegister

    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Username *'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText('First Name *'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText('Last Name *'), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'existing@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Phone *'), {
      target: { value: '1234567890' },
    })
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password *'), {
      target: { value: 'Password123!' },
    })

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
      expect(screen.getByText('Phone number is invalid')).toBeInTheDocument()
    })
  })

  it('displays generic error message when no specific message is provided', async () => {
    const mockRegister = vi.fn().mockRejectedValue({
      response: { status: 500, data: {} },
    })
    const authService = await import('../src/services/auth.service')
    authService.default.register = mockRegister

    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Username *'), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText('First Name *'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText('Last Name *'), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Phone *'), {
      target: { value: '1234567890' },
    })
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'Password123!' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password *'), {
      target: { value: 'Password123!' },
    })

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument()
    })
  })
})
