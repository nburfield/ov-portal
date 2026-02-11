import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ColumnFilter from '../src/components/data-table/ColumnFilter'

const mockColumn = {
  getFilterValue: vi.fn(),
  setFilterValue: vi.fn(),
  columnDef: {
    meta: {},
  },
}

describe('ColumnFilter', () => {
  beforeEach(() => {
    mockColumn.getFilterValue.mockReturnValue('')
    mockColumn.setFilterValue.mockClear()
  })

  it('renders text input for default type', () => {
    render(<ColumnFilter column={mockColumn} />)
    expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument()
  })

  it('calls setFilterValue on text input change', () => {
    render(<ColumnFilter column={mockColumn} />)
    const input = screen.getByPlaceholderText('Filter...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(mockColumn.setFilterValue).toHaveBeenCalledWith('test')
  })

  it('renders select for select type', () => {
    mockColumn.columnDef.meta.type = 'select'
    mockColumn.columnDef.meta.options = [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ]
    render(<ColumnFilter column={mockColumn} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('One')).toBeInTheDocument()
  })

  it('calls setFilterValue on select change', () => {
    mockColumn.columnDef.meta.type = 'select'
    mockColumn.columnDef.meta.options = [{ value: '1', label: 'One' }]
    render(<ColumnFilter column={mockColumn} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })
    expect(mockColumn.setFilterValue).toHaveBeenCalledWith('1')
  })

  it('renders date inputs for date type', () => {
    mockColumn.columnDef.meta.type = 'date'
    mockColumn.getFilterValue.mockReturnValue({ from: '2023-01-01', to: '2023-12-31' })
    render(<ColumnFilter column={mockColumn} />)
    expect(screen.getAllByDisplayValue('2023-01-01')).toHaveLength(1)
    expect(screen.getAllByDisplayValue('2023-12-31')).toHaveLength(1)
  })

  it('calls setFilterValue on date change', () => {
    mockColumn.columnDef.meta.type = 'date'
    render(<ColumnFilter column={mockColumn} />)
    const inputs = screen.getAllByDisplayValue('')
    fireEvent.change(inputs[0], { target: { value: '2023-01-01' } })
    expect(mockColumn.setFilterValue).toHaveBeenCalledWith({ from: '2023-01-01' })
  })
})
