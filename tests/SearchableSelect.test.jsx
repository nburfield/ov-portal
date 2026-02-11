import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchableSelect from '../src/components/ui/SearchableSelect'

describe('SearchableSelect', () => {
  const mockLoadOptions = vi.fn()
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockLoadOptions.mockClear()
    mockOnChange.mockClear()
  })

  it('renders label', () => {
    render(<SearchableSelect label="Search for user" loadOptions={mockLoadOptions} />)
    expect(screen.getByText('Search for user')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<SearchableSelect label="Select" required loadOptions={mockLoadOptions} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders input with placeholder', () => {
    render(<SearchableSelect placeholder="Type to search..." loadOptions={mockLoadOptions} />)
    expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<SearchableSelect error="Please select an option" loadOptions={mockLoadOptions} />)
    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<SearchableSelect error="Error" loadOptions={mockLoadOptions} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('loads options on focus when input is empty', async () => {
    mockLoadOptions.mockResolvedValue([
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ])

    render(<SearchableSelect loadOptions={mockLoadOptions} />)
    const input = screen.getByRole('textbox')

    fireEvent.focus(input)

    await waitFor(() => {
      expect(mockLoadOptions).toHaveBeenCalledWith('')
    })
  })

  it('displays options in dropdown', async () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]
    mockLoadOptions.mockResolvedValue(options)

    render(<SearchableSelect loadOptions={mockLoadOptions} />)
    const input = screen.getByRole('textbox')

    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })

  it('shows "No options found" when no options', async () => {
    mockLoadOptions.mockResolvedValue([])

    render(<SearchableSelect loadOptions={mockLoadOptions} />)
    const input = screen.getByRole('textbox')

    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('No options found')).toBeInTheDocument()
    })
  })

  it('handles option selection', async () => {
    const options = [{ value: '1', label: 'Option 1' }]
    mockLoadOptions.mockResolvedValue(options)

    render(<SearchableSelect loadOptions={mockLoadOptions} onChange={mockOnChange} />)
    const input = screen.getByRole('textbox')

    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Option 1'))

    expect(mockOnChange).toHaveBeenCalledWith('1')
    expect(input).toHaveValue('Option 1')
  })

  it('displays selected value label', async () => {
    const options = [{ value: '1', label: 'Option 1' }]
    mockLoadOptions.mockResolvedValue(options)

    render(<SearchableSelect loadOptions={mockLoadOptions} value="1" onChange={mockOnChange} />)

    await waitFor(() => {
      expect(mockLoadOptions).toHaveBeenCalledWith('')
    })

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Option 1')
  })
})
