import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import AreaChart from '../src/components/charts/AreaChart'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('AreaChart', () => {
  const mockData = [
    { month: 'Jan', revenue: 1000 },
    { month: 'Feb', revenue: 1500 },
  ]

  it('renders title', () => {
    render(<AreaChart data={mockData} title="Test Chart" />)
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })

  it('renders period tabs', () => {
    render(<AreaChart data={mockData} title="Test Chart" />)
    expect(screen.getByText('12 Months')).toBeInTheDocument()
    expect(screen.getByText('6 Months')).toBeInTheDocument()
    expect(screen.getByText('30 Days')).toBeInTheDocument()
  })

  it('renders with data', () => {
    render(<AreaChart data={mockData} title="Test Chart" />)
    // Since recharts renders SVG, check that the component mounts
    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })
})
