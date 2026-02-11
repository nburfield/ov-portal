import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import BulkActions from '../src/components/data-table/BulkActions'

describe('BulkActions', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders nothing when selectedCount is 0', () => {
    const { container } = render(
      <BulkActions
        selectedCount={0}
        totalCount={10}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders selected count text', () => {
    render(
      <BulkActions
        selectedCount={3}
        totalCount={10}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
  })

  it('renders singular "item selected" when selectedCount is 1', () => {
    render(
      <BulkActions
        selectedCount={1}
        totalCount={10}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
  })

  it('renders select all and clear selection buttons', () => {
    render(
      <BulkActions
        selectedCount={2}
        totalCount={10}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    expect(screen.getByText('Select all (10)')).toBeInTheDocument()
    expect(screen.getByText('Clear selection')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <BulkActions
        selectedCount={1}
        totalCount={10}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    expect(screen.getByText('Test Action')).toBeInTheDocument()
  })

  it('calls onSelectAll when select all button is clicked', () => {
    const onSelectAll = vi.fn()
    render(
      <BulkActions
        selectedCount={2}
        totalCount={10}
        onSelectAll={onSelectAll}
        onClearSelection={() => {}}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    fireEvent.click(screen.getByText('Select all (10)'))
    expect(onSelectAll).toHaveBeenCalledTimes(1)
  })

  it('calls onClearSelection when clear selection button is clicked', () => {
    const onClearSelection = vi.fn()
    render(
      <BulkActions
        selectedCount={2}
        totalCount={10}
        onSelectAll={() => {}}
        onClearSelection={onClearSelection}
      >
        <button>Test Action</button>
      </BulkActions>
    )
    fireEvent.click(screen.getByText('Clear selection'))
    expect(onClearSelection).toHaveBeenCalledTimes(1)
  })
})
