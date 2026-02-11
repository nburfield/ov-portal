import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tooltip from '../src/components/ui/Tooltip'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('shows tooltip on hover', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button)
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('hides tooltip on unhover', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button)
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
    fireEvent.mouseLeave(button)
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument()
  })

  it('applies top position', () => {
    render(
      <Tooltip content="Tooltip text" position="top">
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button)
    const tooltip = screen.getByText('Tooltip text')
    expect(tooltip).toHaveClass('bottom-full')
  })
})
