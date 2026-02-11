import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DatePicker from '../src/components/ui/DatePicker'

describe('DatePicker', () => {
  it('renders label', () => {
    render(<DatePicker label="Select Date" />)
    expect(screen.getByText('Select Date')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<DatePicker label="Date" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders input with type date', () => {
    render(<DatePicker />)
    const input = screen.getByTestId('date-input')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('displays error message', () => {
    render(<DatePicker error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<DatePicker error="Error" />)
    const input = screen.getByTestId('date-input')
    expect(input).toHaveClass('border-red-500')
  })

  it('sets value, min, and max attributes', () => {
    render(<DatePicker value="2023-10-01" min="2023-01-01" max="2023-12-31" onChange={() => {}} />)
    const input = screen.getByTestId('date-input')
    expect(input).toHaveAttribute('value', '2023-10-01')
    expect(input).toHaveAttribute('min', '2023-01-01')
    expect(input).toHaveAttribute('max', '2023-12-31')
  })
})
