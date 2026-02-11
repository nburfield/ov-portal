import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RRuleBuilder from '../src/components/forms/RRuleBuilder'

describe('RRuleBuilder', () => {
  it('renders frequency selector', () => {
    render(<RRuleBuilder value="" onChange={() => {}} />)
    expect(screen.getByText('Frequency')).toBeInTheDocument()
    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
  })

  it('renders interval input', () => {
    render(<RRuleBuilder value="" onChange={() => {}} />)
    expect(screen.getByText('Every')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('shows weekly days when frequency is weekly', () => {
    render(<RRuleBuilder value="FREQ=WEEKLY" onChange={() => {}} />)
    expect(screen.getByText('Days of the week')).toBeInTheDocument()
  })

  it('shows monthly day selector when frequency is monthly', () => {
    render(<RRuleBuilder value="FREQ=MONTHLY" onChange={() => {}} />)
    expect(screen.getByText('Day of month')).toBeInTheDocument()
  })

  it('renders end condition selector', () => {
    render(<RRuleBuilder value="" onChange={() => {}} />)
    expect(screen.getByText('End condition')).toBeInTheDocument()
  })

  it('shows preview', () => {
    render(<RRuleBuilder value="FREQ=DAILY" onChange={() => {}} />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('calls onChange with correct RRULE when frequency changes', () => {
    const mockOnChange = vi.fn()
    render(<RRuleBuilder value="RRULE:FREQ=DAILY" onChange={mockOnChange} />)

    const selects = screen.getAllByRole('combobox')
    const freqSelect = selects[0]
    fireEvent.change(freqSelect, { target: { value: '2' } }) // WEEKLY

    expect(mockOnChange).toHaveBeenCalledWith('RRULE:FREQ=WEEKLY;INTERVAL=1')
  })

  it('calls onChange with correct RRULE when interval changes', () => {
    const mockOnChange = vi.fn()
    render(<RRuleBuilder value="RRULE:FREQ=DAILY" onChange={mockOnChange} />)

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '2' } })

    expect(mockOnChange).toHaveBeenCalledWith('RRULE:FREQ=DAILY;INTERVAL=2')
  })
})
