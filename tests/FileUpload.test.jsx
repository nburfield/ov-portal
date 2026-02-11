import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import FileUpload from '../src/components/ui/FileUpload'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('FileUpload', () => {
  const createFile = (name, size, type) => {
    const file = new File(['test'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  it('renders label', () => {
    render(<FileUpload label="Upload File" />)
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('shows dropzone initially', () => {
    render(<FileUpload />)
    expect(screen.getByText('Drag and drop a file here, or click to browse')).toBeInTheDocument()
  })

  it('handles file selection via click', () => {
    const mockOnFile = vi.fn()
    render(<FileUpload onFile={mockOnFile} />)

    const file = createFile('test.txt', 1024, 'text/plain')
    const input = screen.getByDisplayValue('') // hidden input
    fireEvent.change(input, { target: { files: [file] } })

    expect(mockOnFile).toHaveBeenCalledWith(file)
  })

  it('shows image preview', () => {
    const file = createFile('image.jpg', 1024, 'image/jpeg')
    render(<FileUpload />)
    const input = screen.getByDisplayValue('')
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByAltText('Preview')).toBeInTheDocument()
  })

  it('shows filename and size for non-image', () => {
    const file = createFile('document.pdf', 2048, 'application/pdf')
    render(<FileUpload />)
    const input = screen.getByDisplayValue('')
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('2 KB')).toBeInTheDocument()
  })

  it('validates file type', () => {
    const mockOnFile = vi.fn()
    render(<FileUpload onFile={mockOnFile} accept="image/*" />)
    const input = screen.getByDisplayValue('')
    const file = createFile('test.txt', 1024, 'text/plain')
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText(/File type not accepted/)).toBeInTheDocument()
    expect(mockOnFile).not.toHaveBeenCalled()
  })

  it('validates file size', () => {
    const mockOnFile = vi.fn()
    render(<FileUpload onFile={mockOnFile} maxSize={1024} />)
    const input = screen.getByDisplayValue('')
    const file = createFile('large.txt', 2048, 'text/plain')
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText(/File size exceeds/)).toBeInTheDocument()
    expect(mockOnFile).not.toHaveBeenCalled()
  })

  it('handles drag over', () => {
    render(<FileUpload />)
    const dropzone = screen.getByTestId('file-upload-dropzone')

    fireEvent.dragOver(dropzone)
    expect(dropzone).toHaveClass('border-blue-400')

    fireEvent.dragLeave(dropzone)
    expect(dropzone).not.toHaveClass('border-blue-400')
  })

  it('handles drop', () => {
    const mockOnFile = vi.fn()
    render(<FileUpload onFile={mockOnFile} />)
    const dropzone = screen.getByTestId('file-upload-dropzone')

    const file = createFile('dropped.txt', 1024, 'text/plain')
    const dataTransfer = {
      files: [file],
    }
    fireEvent.drop(dropzone, { dataTransfer })

    expect(mockOnFile).toHaveBeenCalledWith(file)
  })

  it('removes file', () => {
    const file = createFile('test.txt', 1024, 'text/plain')
    render(<FileUpload />)
    const input = screen.getByDisplayValue('')
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('test.txt')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Remove file'))

    expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
    expect(screen.getByText('Drag and drop a file here, or click to browse')).toBeInTheDocument()
  })
})
