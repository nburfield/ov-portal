import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import DonutChart from '../src/components/charts/DonutChart'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('DonutChart', () => {
  const mockData = [
    { name: 'Completed', value: 10, color: '#00ff00' },
    { name: 'Pending', value: 5, color: '#ff0000' },
  ]

  it('renders title', () => {
    render(<DonutChart data={mockData} title="Task Status" centerLabel="15 Tasks" />)
    expect(screen.getByText('Task Status')).toBeInTheDocument()
  })

  it('renders center label', () => {
    render(<DonutChart data={mockData} title="Task Status" centerLabel="15 Tasks" />)
    expect(screen.getByText('15 Tasks')).toBeInTheDocument()
  })

  it('renders with data', () => {
    render(<DonutChart data={mockData} title="Task Status" centerLabel="15 Tasks" />)
    // Check that the component mounts
    expect(screen.getByText('Task Status')).toBeInTheDocument()
  })
})
