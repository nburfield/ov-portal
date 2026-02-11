import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import Breadcrumbs from '../src/components/layout/Breadcrumbs'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Breadcrumbs', () => {
  it('renders breadcrumbs with links for all items except last', () => {
    const items = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Customers', to: '/customers' },
      { label: 'Acme Corp', to: '/customers/acme' },
    ]

    render(
      <BrowserRouter>
        <Breadcrumbs items={items} />
      </BrowserRouter>
    )

    // Check that first two are links
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Customers').closest('a')).toHaveAttribute('href', '/customers')

    // Last item is plain text, not a link
    const lastItem = screen.getByText('Acme Corp')
    expect(lastItem.tagName).toBe('SPAN')
    expect(lastItem.closest('a')).toBeNull()
  })

  it('renders single item as plain text', () => {
    const items = [{ label: 'Dashboard', to: '/dashboard' }]

    render(
      <BrowserRouter>
        <Breadcrumbs items={items} />
      </BrowserRouter>
    )

    const item = screen.getByText('Dashboard')
    expect(item.tagName).toBe('SPAN')
  })

  it('renders separators between items', () => {
    const items = [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Customers', to: '/customers' },
    ]

    render(
      <BrowserRouter>
        <Breadcrumbs items={items} />
      </BrowserRouter>
    )

    // Check for chevron separators (SVG elements)
    const separators = document.querySelectorAll('svg')
    expect(separators.length).toBe(1) // One separator between two items
  })
})
