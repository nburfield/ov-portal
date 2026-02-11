import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Select from '../src/components/ui/Select'

describe('Select', () => {
  it('renders label', () => {
    render(<Select label="Choose option" options={[]} />)
    expect(screen.getByText('Choose option')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<Select label="Select" required options={[]} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders options', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]
    render(<Select options={options} />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('displays placeholder', () => {
    render(<Select placeholder="Select an option" options={[]} />)
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Select error="Please select an option" options={[]} />)
    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Select error="Error" options={[]} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('border-red-500')
  })
})
