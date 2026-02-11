import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import Badge from '../src/components/ui/Badge'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge status="active">Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies active status colors', () => {
    render(<Badge status="active">Active</Badge>)
    const badge = screen.getByText('Active')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('applies inactive status colors', () => {
    render(<Badge status="inactive">Inactive</Badge>)
    const badge = screen.getByText('Inactive')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-600')
  })

  it('defaults to active if status not found', () => {
    render(<Badge status="unknown">Unknown</Badge>)
    const badge = screen.getByText('Unknown')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })
})
