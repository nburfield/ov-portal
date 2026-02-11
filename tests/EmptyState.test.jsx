import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import EmptyState from '../src/components/ui/EmptyState'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items found" description="There are no items to display." />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('There are no items to display.')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <EmptyState
        icon={ExclamationTriangleIcon}
        title="Warning"
        description="Something went wrong."
      />
    )
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('h-12', 'w-12')
  })

  it('does not render icon when not provided', () => {
    render(<EmptyState title="No data" description="No data available." />)
    const icon = document.querySelector('svg')
    expect(icon).not.toBeInTheDocument()
  })

  it('renders action button when actionLabel and onAction provided', () => {
    const mockOnAction = vi.fn()
    render(
      <EmptyState
        title="Empty"
        description="No content."
        actionLabel="Add Item"
        onAction={mockOnAction}
      />
    )
    const button = screen.getByRole('button', { name: 'Add Item' })
    expect(button).toBeInTheDocument()
  })

  it('does not render action button when actionLabel or onAction missing', () => {
    render(<EmptyState title="Empty" description="No content." actionLabel="Add Item" />)
    const button = screen.queryByRole('button')
    expect(button).not.toBeInTheDocument()
  })

  it('calls onAction when button is clicked', () => {
    const mockOnAction = vi.fn()
    render(
      <EmptyState
        title="Empty"
        description="No content."
        actionLabel="Add Item"
        onAction={mockOnAction}
      />
    )
    const button = screen.getByRole('button', { name: 'Add Item' })
    fireEvent.click(button)
    expect(mockOnAction).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<EmptyState title="Test" description="Test desc" className="custom-class" />)
    const container = document.querySelector('.flex.flex-col.items-center')
    expect(container).toHaveClass('custom-class')
  })
})
