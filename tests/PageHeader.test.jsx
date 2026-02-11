import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageHeader from '../src/components/layout/PageHeader'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument()
  })

  it('renders children in actions area', () => {
    render(
      <PageHeader title="Test Title">
        <button>Action 1</button>
        <button>Action 2</button>
      </PageHeader>
    )
    expect(screen.getByText('Action 1')).toBeInTheDocument()
    expect(screen.getByText('Action 2')).toBeInTheDocument()
  })

  it('does not render actions area when no children', () => {
    render(<PageHeader title="Test Title" />)
    const actionsArea = document.querySelector('.flex.items-center.space-x-2')
    expect(actionsArea).toBeNull()
  })
})
