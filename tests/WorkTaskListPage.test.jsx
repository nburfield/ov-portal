import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import { BusinessProvider } from '../src/contexts/BusinessContext'
import WorkTaskListPage from '../src/pages/worktasks/WorkTaskListPage'

// Mock dependencies
vi.mock('../src/hooks/useApiQuery', () => ({
  useApiQuery: vi.fn(() => ({ data: [], isLoading: false })),
}))
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { key: 'user1' } })),
}))
vi.mock('../src/hooks/useBusiness', () => ({
  useBusiness: vi.fn(() => ({
    activeBusiness: { business_key: 'biz1' },
    getCurrentRoles: vi.fn(() => ['manager']),
  })),
}))
vi.mock('../src/hooks/useToast', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}))
vi.mock('../src/services/worktask.service', () => ({
  getAll: vi.fn(),
}))

const renderWorkTaskListPage = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <BusinessProvider>
            <WorkTaskListPage />
          </BusinessProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('WorkTaskListPage', () => {
  it('renders the page title', () => {
    renderWorkTaskListPage()

    expect(screen.getByText('Work Tasks')).toBeInTheDocument()
  })

  it('renders quick filter buttons', () => {
    renderWorkTaskListPage()

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Missed')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
  })
})
