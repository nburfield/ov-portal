import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../src/contexts/AuthContext'
import { useAuth } from '../src/hooks/useAuth'

function TestHookComponent() {
  const auth = useAuth()
  return <div data-testid="auth-present">{auth ? 'present' : 'absent'}</div>
}

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('should return auth context when used within provider', () => {
    function TestComponent() {
      const auth = useAuth()
      return <div data-testid="has-auth">{auth ? 'yes' : 'no'}</div>
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByTestId('has-auth').textContent).toBe('yes')
  })

  it('should throw error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestHookComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    )

    consoleSpy.mockRestore()
  })
})
