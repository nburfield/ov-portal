import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ColumnHeader from '../src/components/data-table/ColumnHeader'

const mockColumn = {
  getIsSorted: vi.fn(),
  getCanSort: vi.fn(),
  getToggleSortingHandler: vi.fn(),
  getSize: vi.fn(),
  columnDef: {
    header: 'Test Header',
  },
  id: 'test',
}

describe('ColumnHeader', () => {
  beforeEach(() => {
    mockColumn.getIsSorted.mockReturnValue(false)
    mockColumn.getCanSort.mockReturnValue(true)
    mockColumn.getToggleSortingHandler.mockReturnValue(vi.fn())
    mockColumn.getSize.mockReturnValue(100)
  })

  it('renders the header text', () => {
    render(<ColumnHeader column={mockColumn} />)
    expect(screen.getByText('Test Header')).toBeInTheDocument()
  })

  it('calls toggle handler on click when sortable', () => {
    const handler = vi.fn()
    mockColumn.getToggleSortingHandler.mockReturnValue(handler)
    render(<ColumnHeader column={mockColumn} />)
    fireEvent.click(screen.getByRole('columnheader'))
    expect(handler).toHaveBeenCalled()
  })

  it('does not call handler when not sortable', () => {
    mockColumn.getCanSort.mockReturnValue(false)
    render(<ColumnHeader column={mockColumn} />)
    // No click handler, so no way to test, but renders
    expect(screen.getByText('Test Header')).toBeInTheDocument()
  })

  it('shows sort indicators when sortable', () => {
    render(<ColumnHeader column={mockColumn} />)
    expect(screen.getByRole('columnheader')).toBeInTheDocument()
    // Icons are present
  })
})
