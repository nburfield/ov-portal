import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExportButton from '../src/components/data-table/ExportButton'

describe('ExportButton', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders export button', () => {
    render(<ExportButton onExportCSV={() => {}} onExportPDF={() => {}} />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('toggles dropdown on button click', () => {
    render(<ExportButton onExportCSV={() => {}} onExportPDF={() => {}} />)
    const button = screen.getByRole('button', { name: /export/i })

    // Initially dropdown not visible
    expect(screen.queryByText('CSV')).not.toBeInTheDocument()
    expect(screen.queryByText('PDF')).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(button)
    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()

    // Click again to close
    fireEvent.click(button)
    expect(screen.queryByText('CSV')).not.toBeInTheDocument()
    expect(screen.queryByText('PDF')).not.toBeInTheDocument()
  })

  it('calls onExportCSV when CSV option is clicked', () => {
    const onExportCSV = vi.fn()
    render(<ExportButton onExportCSV={onExportCSV} onExportPDF={() => {}} />)
    const button = screen.getByRole('button', { name: /export/i })

    fireEvent.click(button)
    fireEvent.click(screen.getByText('CSV'))

    expect(onExportCSV).toHaveBeenCalledTimes(1)
  })

  it('calls onExportPDF when PDF option is clicked', () => {
    const onExportPDF = vi.fn()
    render(<ExportButton onExportCSV={() => {}} onExportPDF={onExportPDF} />)
    const button = screen.getByRole('button', { name: /export/i })

    fireEvent.click(button)
    fireEvent.click(screen.getByText('PDF'))

    expect(onExportPDF).toHaveBeenCalledTimes(1)
  })

  it('closes dropdown after selecting CSV', () => {
    render(<ExportButton onExportCSV={() => {}} onExportPDF={() => {}} />)
    const button = screen.getByRole('button', { name: /export/i })

    fireEvent.click(button)
    expect(screen.getByText('CSV')).toBeInTheDocument()

    fireEvent.click(screen.getByText('CSV'))
    expect(screen.queryByText('CSV')).not.toBeInTheDocument()
  })

  it('closes dropdown after selecting PDF', () => {
    render(<ExportButton onExportCSV={() => {}} onExportPDF={() => {}} />)
    const button = screen.getByRole('button', { name: /export/i })

    fireEvent.click(button)
    expect(screen.getByText('PDF')).toBeInTheDocument()

    fireEvent.click(screen.getByText('PDF'))
    expect(screen.queryByText('PDF')).not.toBeInTheDocument()
  })
})
