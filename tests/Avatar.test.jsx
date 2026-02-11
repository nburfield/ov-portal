import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import Avatar from '../src/components/ui/Avatar'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Avatar', () => {
  it('renders initials', () => {
    render(<Avatar firstName="John" lastName="Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    render(<Avatar firstName="John" lastName="Doe" />)
    const avatar = screen.getByText('JD')
    expect(avatar).toHaveClass('h-8', 'w-8', 'text-sm')
  })

  it('applies sm size', () => {
    render(<Avatar firstName="John" lastName="Doe" size="sm" />)
    const avatar = screen.getByText('JD')
    expect(avatar).toHaveClass('h-6', 'w-6', 'text-xs')
  })

  it('applies lg size', () => {
    render(<Avatar firstName="John" lastName="Doe" size="lg" />)
    const avatar = screen.getByText('JD')
    expect(avatar).toHaveClass('h-10', 'w-10', 'text-base')
  })

  it('has consistent background color for same name', () => {
    const { rerender } = render(<Avatar firstName="John" lastName="Doe" />)
    const color1 = screen.getByText('JD').className
    rerender(<Avatar firstName="John" lastName="Doe" />)
    const color2 = screen.getByText('JD').className
    expect(color1).toBe(color2)
  })
})
