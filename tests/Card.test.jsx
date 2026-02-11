import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import Card from '../src/components/ui/Card'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<Card title="Card Title">Content</Card>)
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('bg-white', 'border', 'rounded-lg', 'shadow-sm', 'p-6')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('custom-class')
  })
})
