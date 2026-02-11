import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import JsonEditor from '../src/components/forms/JsonEditor'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('JsonEditor', () => {
  it('renders add field button', () => {
    render(<JsonEditor />)
    expect(screen.getByTestId('add-field-button')).toBeInTheDocument()
  })

  it('renders initial value as key-value pairs', () => {
    const initialValue = { key1: 'value1', key2: 'value2' }
    render(<JsonEditor value={initialValue} />)

    expect(screen.getByDisplayValue('key1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('value1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('key2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('value2')).toBeInTheDocument()
  })

  it('calls onChange when key is updated', () => {
    const mockOnChange = vi.fn()
    const initialValue = { oldKey: 'value' }
    render(<JsonEditor value={initialValue} onChange={mockOnChange} />)

    const keyInput = screen.getByDisplayValue('oldKey')
    fireEvent.change(keyInput, { target: { value: 'newKey' } })

    expect(mockOnChange).toHaveBeenCalledWith({ newKey: 'value' })
  })

  it('calls onChange when value is updated', () => {
    const mockOnChange = vi.fn()
    const initialValue = { key: 'oldValue' }
    render(<JsonEditor value={initialValue} onChange={mockOnChange} />)

    const valueInput = screen.getByDisplayValue('oldValue')
    fireEvent.change(valueInput, { target: { value: 'newValue' } })

    expect(mockOnChange).toHaveBeenCalledWith({ key: 'newValue' })
  })

  it('adds new entry when add field button is clicked', () => {
    const mockOnChange = vi.fn()
    render(<JsonEditor onChange={mockOnChange} />)

    const addButton = screen.getByTestId('add-field-button')
    fireEvent.click(addButton)

    expect(screen.getByTestId('key-input-0')).toBeInTheDocument()
    expect(screen.getByTestId('value-input-0')).toBeInTheDocument()
    expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
  })

  it('removes entry when delete button is clicked', () => {
    const mockOnChange = vi.fn()
    const initialValue = { key1: 'value1', key2: 'value2' }
    render(<JsonEditor value={initialValue} onChange={mockOnChange} />)

    const deleteButton = screen.getByTestId('delete-button-0')
    fireEvent.click(deleteButton)

    // Should have one less entry
    expect(screen.getAllByTestId(/^key-input-/)).toHaveLength(1)
    expect(screen.getAllByTestId(/^value-input-/)).toHaveLength(1)
    expect(mockOnChange).toHaveBeenCalledWith({ key2: 'value2' })
  })

  it('filters out entries with empty keys when emitting change', () => {
    const mockOnChange = vi.fn()
    const initialValue = { validKey: 'value' }
    render(<JsonEditor value={initialValue} onChange={mockOnChange} />)

    // Add a new entry
    const addButton = screen.getByTestId('add-field-button')
    fireEvent.click(addButton)

    // The new entry has empty key and value, so it should be filtered out
    expect(mockOnChange).toHaveBeenLastCalledWith({ validKey: 'value' })
  })

  it('trims whitespace from keys', () => {
    const mockOnChange = vi.fn()
    render(<JsonEditor onChange={mockOnChange} />)

    // Add a new entry
    const addButton = screen.getByTestId('add-field-button')
    fireEvent.click(addButton)

    const keyInput = screen.getByTestId('key-input-0')
    fireEvent.change(keyInput, { target: { value: '  key  ' } })

    const valueInput = screen.getByTestId('value-input-0')
    fireEvent.change(valueInput, { target: { value: 'value' } })

    expect(mockOnChange).toHaveBeenLastCalledWith({ key: 'value' })
  })

  it('renders with custom className', () => {
    const { container } = render(<JsonEditor className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
