import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfirmDialog from '../src/components/ui/ConfirmDialog'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('ConfirmDialog', () => {
  it('renders with default title', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        description="Test description"
      />
    )
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders with custom title and confirm label', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Custom Title"
        description="Test description"
        confirmLabel="Delete"
      />
    )
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        description="Test description"
      />
    )
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Confirm is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        description="Test description"
      />
    )
    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('applies danger variant by default', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        description="Test description"
      />
    )
    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton).toHaveClass('bg-red-600')
  })

  it('applies primary variant for accent', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        description="Test description"
        variant="accent"
      />
    )
    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton).toHaveClass('bg-blue-600')
  })
})
