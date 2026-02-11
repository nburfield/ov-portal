import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import { BusinessProvider } from '../src/contexts/BusinessContext'
import SubcontractorListPage from '../src/pages/subcontractors/SubcontractorListPage'

// Mock dependencies
vi.mock('../src/hooks/useApiQuery', () => ({
  useApiQuery: vi.fn(() => ({ data: [], isLoading: false, refetch: vi.fn() })),
}))
vi.mock('../src/hooks/useBusiness', () => ({
  useBusiness: vi.fn(() => ({
    activeBusiness: { business_key: 'biz1' },
  })),
}))
vi.mock('../src/hooks/useToast', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}))
vi.mock('../src/services/business.service', () => ({
  getSubcontractors: vi.fn(),
  addSubcontractor: vi.fn(),
  removeSubcontractor: vi.fn(),
  getAll: vi.fn(),
}))

const renderSubcontractorListPage = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <BusinessProvider>
            <SubcontractorListPage />
          </BusinessProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('SubcontractorListPage', () => {
  it('renders the page title', () => {
    renderSubcontractorListPage()

    expect(screen.getByText('Subcontractors')).toBeInTheDocument()
  })

  it('renders the add subcontractor button', () => {
    renderSubcontractorListPage()

    expect(screen.getByText('+ Add Subcontractor')).toBeInTheDocument()
  })

  it('opens add subcontractor modal when button is clicked', () => {
    renderSubcontractorListPage()

    const addButton = screen.getByText('+ Add Subcontractor')
    fireEvent.click(addButton)

    expect(screen.getByText('Add Subcontractor')).toBeInTheDocument()
  })
})
