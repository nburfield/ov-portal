import { describe, it, expect, vi, beforeAll } from 'vitest'
import { exportToCSV, exportToPDF } from '../src/utils/export.js'

beforeAll(() => {
  vi.stubGlobal('document', {
    createElement: vi.fn(() => ({
      click: vi.fn(),
      style: {},
      href: '',
      download: '',
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  })
  vi.stubGlobal('window', {
    open: vi.fn(() => ({
      document: {
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: vi.fn(),
    })),
  })
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:url'),
    revokeObjectURL: vi.fn(),
  })
})

describe('export utilities', () => {
  const mockData = [
    { name: 'John Doe', age: 30, city: 'New York' },
    { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
  ]

  const mockColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'age', header: 'Age' },
    { accessorKey: 'city', header: 'City' },
  ]

  describe('exportToCSV', () => {
    it('should be a function', () => {
      expect(typeof exportToCSV).toBe('function')
    })

    it('should throw error for invalid data', () => {
      expect(() => exportToCSV(null, mockColumns, 'test')).toThrow(
        'Invalid data or columns provided'
      )
      expect(() => exportToCSV([], null, 'test')).toThrow('Invalid data or columns provided')
    })

    it('should not throw for valid inputs', () => {
      expect(() => exportToCSV(mockData, mockColumns, 'test')).not.toThrow()
    })
  })

  describe('exportToPDF', () => {
    it('should be a function', () => {
      expect(typeof exportToPDF).toBe('function')
    })

    it('should throw error for invalid data', () => {
      expect(() => exportToPDF(null, mockColumns, 'test')).toThrow(
        'Invalid data or columns provided'
      )
      expect(() => exportToPDF([], null, 'test')).toThrow('Invalid data or columns provided')
    })

    it('should not throw for valid inputs', () => {
      expect(() => exportToPDF(mockData, mockColumns, 'test')).not.toThrow()
    })
  })
})
