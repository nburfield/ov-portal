import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FormActions from '../src/components/forms/FormActions'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('FormActions', () => {
  it('renders Cancel button', () => {
    render(<FormActions onCancel={() => {}} onSubmit={() => {}} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders Save button with default label', () => {
    render(<FormActions onCancel={() => {}} onSubmit={() => {}} />)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('renders custom submit label', () => {
    render(<FormActions onCancel={() => {}} onSubmit={() => {}} submitLabel="Submit" />)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('shows Saving when isSubmitting', () => {
    render(<FormActions onCancel={() => {}} onSubmit={() => {}} isSubmitting />)
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('calls onCancel on click', () => {
    const mockCancel = vi.fn()
    render(<FormActions onCancel={mockCancel} onSubmit={() => {}} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockCancel).toHaveBeenCalled()
  })

  it('calls onSubmit on click', () => {
    const mockSubmit = vi.fn()
    render(<FormActions onCancel={() => {}} onSubmit={mockSubmit} />)
    fireEvent.click(screen.getByText('Save'))
    expect(mockSubmit).toHaveBeenCalled()
  })

  it('disables submit button when isSubmitting', () => {
    render(<FormActions onCancel={() => {}} onSubmit={() => {}} isSubmitting />)
    const button = screen.getByText('Saving...')
    expect(button).toBeDisabled()
  })
})
