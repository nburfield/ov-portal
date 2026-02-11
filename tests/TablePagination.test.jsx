import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import TablePagination from '../src/components/data-table/TablePagination'

// Mock TanStack table
const mockTable = {
  getState: vi.fn(() => ({ pagination: { pageIndex: 2, pageSize: 10 } })),
  getFilteredRowModel: vi.fn(() => ({ rows: Array(50) })),
  getPageCount: vi.fn(() => 5),
  setPageSize: vi.fn(),
  setPageIndex: vi.fn(),
  getCanPreviousPage: vi.fn(() => true),
  getCanNextPage: vi.fn(() => true),
  previousPage: vi.fn(),
  nextPage: vi.fn(),
}

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('TablePagination', () => {
  it('renders showing text', () => {
    render(<TablePagination table={mockTable} />)
    expect(screen.getByText('Showing 21 to 30 of 50')).toBeInTheDocument()
  })

  it('renders page size selector', () => {
    render(<TablePagination table={mockTable} />)
    expect(screen.getByText('Rows per page:')).toBeInTheDocument()
  })

  it('renders page navigation buttons', () => {
    render(<TablePagination table={mockTable} />)
    expect(screen.getAllByRole('button')).toHaveLength(9) // first, prev, 5 pages, next, last
  })

  it('calls setPageSize when page size changes', () => {
    render(<TablePagination table={mockTable} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '25' } })
    expect(mockTable.setPageSize).toHaveBeenCalledWith(25)
  })

  it('calls setPageIndex when first button is clicked', () => {
    render(<TablePagination table={mockTable} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0]) // first button
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(0)
  })

  it('calls previousPage when prev button is clicked', () => {
    render(<TablePagination table={mockTable} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1]) // prev button
    expect(mockTable.previousPage).toHaveBeenCalled()
  })

  it('calls setPageIndex when page number is clicked', () => {
    render(<TablePagination table={mockTable} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2]) // page 1 (index 0)
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(0)
  })

  it('calls nextPage when next button is clicked', () => {
    render(<TablePagination table={mockTable} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[7]) // next button
    expect(mockTable.nextPage).toHaveBeenCalled()
  })

  it('calls setPageIndex when last button is clicked', () => {
    render(<TablePagination table={mockTable} />)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[8]) // last button
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(4)
  })
})
