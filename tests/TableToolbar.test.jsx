import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import TableToolbar from '../src/components/data-table/TableToolbar'

// Mock TanStack table
const mockTable = {
  getAllColumns: vi.fn(() => [
    {
      id: 'col1',
      getIsVisible: vi.fn(() => true),
      getToggleVisibilityHandler: vi.fn(() => vi.fn()),
      columnDef: { header: 'Column 1' },
    },
    {
      id: 'col2',
      getIsVisible: vi.fn(() => false),
      getToggleVisibilityHandler: vi.fn(() => vi.fn()),
      columnDef: { header: 'Column 2' },
    },
  ]),
  resetColumnFilters: vi.fn(),
}

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('TableToolbar', () => {
  const defaultProps = {
    table: mockTable,
    globalFilter: '',
    onGlobalFilterChange: vi.fn(),
    onExportCSV: vi.fn(),
    onExportPDF: vi.fn(),
  }

  it('renders search input', () => {
    render(<TableToolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders column visibility button', () => {
    render(<TableToolbar {...defaultProps} />)
    expect(screen.getByText('Columns')).toBeInTheDocument()
  })

  it('renders reset button', () => {
    render(<TableToolbar {...defaultProps} />)
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('renders export buttons', () => {
    render(<TableToolbar {...defaultProps} />)
    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  it('calls onGlobalFilterChange with debounce', async () => {
    vi.useFakeTimers()
    render(<TableToolbar {...defaultProps} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(defaultProps.onGlobalFilterChange).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(defaultProps.onGlobalFilterChange).toHaveBeenCalledWith('test')
    vi.useRealTimers()
  })

  it('calls onExportCSV when CSV button is clicked', () => {
    render(<TableToolbar {...defaultProps} />)
    const csvButton = screen.getByText('CSV')
    fireEvent.click(csvButton)
    expect(defaultProps.onExportCSV).toHaveBeenCalled()
  })

  it('calls onExportPDF when PDF button is clicked', () => {
    render(<TableToolbar {...defaultProps} />)
    const pdfButton = screen.getByText('PDF')
    fireEvent.click(pdfButton)
    expect(defaultProps.onExportPDF).toHaveBeenCalled()
  })

  it('calls resetColumnFilters when reset button is clicked', () => {
    render(<TableToolbar {...defaultProps} />)
    const resetButton = screen.getByText('Reset')
    fireEvent.click(resetButton)
    expect(mockTable.resetColumnFilters).toHaveBeenCalled()
  })
})
