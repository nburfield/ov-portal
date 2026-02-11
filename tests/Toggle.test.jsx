import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toggle from '../src/components/ui/Toggle'

describe('Toggle', () => {
  it('renders label', () => {
    render(<Toggle label="Enable feature" />)
    expect(screen.getByText('Enable feature')).toBeInTheDocument()
  })

  it('calls onChange when clicked', () => {
    const mockOnChange = vi.fn()
    render(<Toggle checked={false} onChange={mockOnChange} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockOnChange).toHaveBeenCalledWith(true)
  })

  it('applies checked styles when checked is true', () => {
    render(<Toggle checked={true} onChange={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('applies unchecked styles when checked is false', () => {
    render(<Toggle checked={false} onChange={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200')
  })
})
