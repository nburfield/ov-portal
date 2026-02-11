import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { AuthProvider } from '../src/contexts/AuthContext'
import AdminDataExplorerPage from '../src/pages/admin/AdminDataExplorerPage'

// Mock the services
vi.mock('../src/services/user.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/business.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/service.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/customer.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/location.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/fleetasset.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/workorder.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/worktask.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/invoice.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/invoicelineitem.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/userrole.service', () => ({
  getAll: vi.fn(),
}))

vi.mock('../src/services/userservice.service', () => ({
  getAll: vi.fn(),
}))

// Mock the toast hook
vi.mock('../src/hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

const renderAdminDataExplorerPage = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminDataExplorerPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('AdminDataExplorerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page with all required elements', () => {
    renderAdminDataExplorerPage()

    expect(screen.getByText('Admin - Data Explorer')).toBeInTheDocument()
    expect(screen.getByText('Object Type')).toBeInTheDocument()
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('renders object type dropdown with all options', () => {
    renderAdminDataExplorerPage()

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    // Check that all object types are available
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Businesses')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.getByText('Locations')).toBeInTheDocument()
    expect(screen.getByText('Fleet Assets')).toBeInTheDocument()
    expect(screen.getByText('Work Orders')).toBeInTheDocument()
    expect(screen.getByText('Work Tasks')).toBeInTheDocument()
    expect(screen.getByText('Invoices')).toBeInTheDocument()
    expect(screen.getByText('Invoice Line Items')).toBeInTheDocument()
    expect(screen.getByText('User Roles')).toBeInTheDocument()
    expect(screen.getByText('User Services')).toBeInTheDocument()
  })

  it('renders initial filter row', () => {
    renderAdminDataExplorerPage()

    const filterInputs = screen.getAllByPlaceholderText('Filter key')
    expect(filterInputs).toHaveLength(1)

    const valueInputs = screen.getAllByPlaceholderText('Filter value')
    expect(valueInputs).toHaveLength(1)
  })

  it('allows adding and removing filter rows', () => {
    renderAdminDataExplorerPage()

    // Initially one filter row
    expect(screen.getAllByPlaceholderText('Filter key')).toHaveLength(1)

    // Add a filter
    const addButton = screen.getByRole('button', { name: 'Add Filter' })
    fireEvent.click(addButton)

    expect(screen.getAllByPlaceholderText('Filter key')).toHaveLength(2)

    // Remove a filter
    const removeButtons = screen.getAllByRole('button', { name: '' }) // Trash icon buttons
    fireEvent.click(removeButtons[1]) // Remove the second filter

    expect(screen.getAllByPlaceholderText('Filter key')).toHaveLength(1)
  })

  it('disables search button when no object type is selected', () => {
    renderAdminDataExplorerPage()

    const searchButton = screen.getByRole('button', { name: 'Search' })
    expect(searchButton).toBeDisabled()
  })

  it('enables search button when object type is selected', () => {
    renderAdminDataExplorerPage()

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'users' } })

    const searchButton = screen.getByRole('button', { name: 'Search' })
    expect(searchButton).not.toBeDisabled()
  })

  it('calls the correct service when searching', async () => {
    const { getAll } = await import('../src/services/user.service')
    getAll.mockResolvedValue([{ id: 1, name: 'Test User' }])

    renderAdminDataExplorerPage()

    // Select object type - use the actual select element
    const selectElement = screen.getByRole('combobox')
    fireEvent.change(selectElement, { target: { value: 'users' } })

    // Click search
    const searchButton = screen.getByRole('button', { name: 'Search' })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(getAll).toHaveBeenCalledWith({})
    })
  })

  it('passes filters to the service', async () => {
    const { getAll } = await import('../src/services/user.service')
    getAll.mockResolvedValue([{ id: 1, name: 'Test User' }])

    renderAdminDataExplorerPage()

    // Select object type
    const selectElement = screen.getByRole('combobox')
    fireEvent.change(selectElement, { target: { value: 'users' } })

    // Add filters
    const keyInputs = screen.getAllByPlaceholderText('Filter key')
    const valueInputs = screen.getAllByPlaceholderText('Filter value')

    fireEvent.change(keyInputs[0], { target: { value: 'status' } })
    fireEvent.change(valueInputs[0], { target: { value: 'active' } })

    // Click search
    const searchButton = screen.getByRole('button', { name: 'Search' })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(getAll).toHaveBeenCalledWith({ status: 'active' })
    })
  })

  it('displays results as JSON', async () => {
    const { getAll } = await import('../src/services/user.service')
    const mockData = [{ id: 1, name: 'Test User', status: 'active' }]
    getAll.mockResolvedValue(mockData)

    renderAdminDataExplorerPage()

    // Select object type
    const selectElement = screen.getByRole('combobox')
    fireEvent.change(selectElement, { target: { value: 'users' } })

    // Add filters for the test
    const keyInputs = screen.getAllByPlaceholderText('Filter key')
    const valueInputs = screen.getAllByPlaceholderText('Filter value')

    fireEvent.change(keyInputs[0], { target: { value: 'status' } })
    fireEvent.change(valueInputs[0], { target: { value: 'active' } })

    const searchButton = screen.getByRole('button', { name: 'Search' })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument()
      expect(screen.getByText(JSON.stringify(mockData, null, 2))).toBeInTheDocument()
    })
  })
})
