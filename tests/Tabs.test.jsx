import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tabs from '../src/components/ui/Tabs'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Tabs', () => {
  const mockTabs = [
    { key: 'details', label: 'Details' },
    { key: 'settings', label: 'Settings' },
    { key: 'permissions', label: 'Permissions' },
  ]

  const mockOnChange = vi.fn()

  it('renders all tabs', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)
    mockTabs.forEach((tab) => {
      expect(screen.getByText(tab.label)).toBeInTheDocument()
    })
  })

  it('applies correct ARIA attributes', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)
    const tablist = screen.getByRole('tablist')
    expect(tablist).toBeInTheDocument()

    const activeTab = screen.getByRole('tab', { selected: true })
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
    expect(activeTab).toHaveAttribute('id', 'tab-details')

    const inactiveTabs = screen.getAllByRole('tab', { selected: false })
    expect(inactiveTabs.length).toBe(2)
    inactiveTabs.forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected', 'false')
    })
  })

  it('highlights active tab with blue border and bold text', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)
    const activeTab = screen.getByText('Details')
    expect(activeTab).toHaveClass('border-blue-500', 'font-semibold', 'text-blue-600')
  })

  it('calls onChange when clicking a tab', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('Settings'))
    expect(mockOnChange).toHaveBeenCalledWith('settings')
  })

  it('supports keyboard navigation with arrow keys', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)

    const activeTab = screen.getByRole('tab', { selected: true })
    fireEvent.keyDown(activeTab, { key: 'ArrowRight' })
    expect(mockOnChange).toHaveBeenCalledWith('settings')
  })

  it('supports keyboard navigation to previous tab', () => {
    render(<Tabs tabs={mockTabs} activeTab="settings" onChange={mockOnChange} />)

    const activeTab = screen.getByRole('tab', { selected: true })
    fireEvent.keyDown(activeTab, { key: 'ArrowLeft' })
    expect(mockOnChange).toHaveBeenCalledWith('details')
  })

  it('supports Home key to go to first tab', () => {
    render(<Tabs tabs={mockTabs} activeTab="permissions" onChange={mockOnChange} />)

    const activeTab = screen.getByRole('tab', { selected: true })
    fireEvent.keyDown(activeTab, { key: 'Home' })
    expect(mockOnChange).toHaveBeenCalledWith('details')
  })

  it('supports End key to go to last tab', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)

    const activeTab = screen.getByRole('tab', { selected: true })
    fireEvent.keyDown(activeTab, { key: 'End' })
    expect(mockOnChange).toHaveBeenCalledWith('permissions')
  })

  it('supports Enter key to activate tab', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)

    const settingsTab = screen.getByText('Settings')
    fireEvent.keyDown(settingsTab, { key: 'Enter' })
    expect(mockOnChange).toHaveBeenCalledWith('settings')
  })

  it('supports Space key to activate tab', () => {
    render(<Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} />)

    const settingsTab = screen.getByText('Settings')
    fireEvent.keyDown(settingsTab, { key: ' ' })
    expect(mockOnChange).toHaveBeenCalledWith('settings')
  })

  it('applies custom className', () => {
    render(
      <Tabs tabs={mockTabs} activeTab="details" onChange={mockOnChange} className="custom-tabs" />
    )
    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveClass('custom-tabs')
  })
})
