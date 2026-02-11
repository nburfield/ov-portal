import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Textarea from '../src/components/ui/Textarea'

describe('Textarea', () => {
  it('renders label', () => {
    render(<Textarea label="Description" />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('shows required asterisk when required', () => {
    render(<Textarea label="Message" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders textarea with correct rows', () => {
    render(<Textarea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('displays error message', () => {
    render(<Textarea error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Textarea error="Error" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-500')
  })
})
