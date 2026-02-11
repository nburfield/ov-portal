import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatCard from '../src/components/charts/StatCard'
import { ChartBarIcon } from '@heroicons/react/24/outline'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard icon={ChartBarIcon} label="Test Label" value="123" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<StatCard icon={ChartBarIcon} label="Label" value="Value" />)
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders trend with positive indicator', () => {
    render(
      <StatCard
        icon={ChartBarIcon}
        label="Label"
        value="Value"
        trend={{ value: 10, isPositive: true }}
      />
    )
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('renders trend with negative indicator', () => {
    render(
      <StatCard
        icon={ChartBarIcon}
        label="Label"
        value="Value"
        trend={{ value: 5, isPositive: false }}
      />
    )
    expect(screen.getByText('5%')).toBeInTheDocument()
  })

  it('applies accent color', () => {
    render(<StatCard icon={ChartBarIcon} label="Label" value="Value" color="accent" />)
    const iconContainer = document.querySelector('.rounded-full')
    expect(iconContainer).toHaveClass('bg-blue-100')
  })

  it('applies success color', () => {
    render(<StatCard icon={ChartBarIcon} label="Label" value="Value" color="success" />)
    const iconContainer = document.querySelector('.rounded-full')
    expect(iconContainer).toHaveClass('bg-green-100')
  })

  it('applies warning color', () => {
    render(<StatCard icon={ChartBarIcon} label="Label" value="Value" color="warning" />)
    const iconContainer = document.querySelector('.rounded-full')
    expect(iconContainer).toHaveClass('bg-yellow-100')
  })
})
