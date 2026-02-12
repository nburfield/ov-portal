import React, { useEffect, useState } from 'react'
import { flexRender } from '@tanstack/react-table'
import { cn } from '../../utils/cn'
import { useDataTable } from '../../hooks/useDataTable'
import ColumnHeader from './ColumnHeader'
import TableToolbar from './TableToolbar'
import TablePagination from './TablePagination'
import BulkActions from './BulkActions'
import ExportButton from './ExportButton'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const DataTable = ({
  columns,
  data,
  isLoading = false,
  emptyState,
  onRowClick,
  enableSelection = true,
  initialSorting = [],
  initialPagination = { pageIndex: 0, pageSize: 10 },
  initialColumnVisibility = {},
  initialColumnFilters = [],
  initialGlobalFilter = '',
  onExportCSV,
  onExportPDF,
  bulkActions,
  onSelectionChange,
  variant = 'default',
  className,
}) => {
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)

  const selectColumn = enableSelection
    ? {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-border bg-bg-card text-accent focus:ring-accent/20"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-border bg-bg-card text-accent focus:ring-accent/20"
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        size: 48,
        enableSorting: false,
        enableResizing: false,
      }
    : null

  const allColumns = selectColumn ? [selectColumn, ...columns] : columns

  const table = useDataTable({
    data,
    columns: allColumns,
    initialSorting,
    initialPagination,
    initialColumnVisibility,
    initialColumnFilters,
    initialGlobalFilter: globalFilter,
    enableSelection,
  })

  const { rows } = table.getRowModel()
  const selectedCount = table.getSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows
      onSelectionChange(selectedRows)
    }
  }, [table, onSelectionChange])

  const variants = {
    default: 'bg-bg-card border border-border rounded-xl shadow-sm',
    plain: '',
    bordered: 'border border-border rounded-xl',
  }

  const defaultEmptyState = {
    icon: MagnifyingGlassIcon,
    title: 'No data found',
    description: 'Try adjusting your search or filter criteria',
  }

  return (
    <div className={cn('space-y-4', className)}>
      {selectedCount > 0 && (
        <BulkActions
          selectedCount={selectedCount}
          totalCount={totalCount}
          onSelectAll={table.getToggleAllRowsSelectedHandler()}
          onClearSelection={() => table.toggleAllRowsSelected(false)}
        >
          {bulkActions}
          <ExportButton onExportCSV={onExportCSV} onExportPDF={onExportPDF} />
        </BulkActions>
      )}

      <div className={cn('overflow-hidden', variants[variant])}>
        <TableToolbar
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          onExportCSV={onExportCSV}
          onExportPDF={onExportPDF}
        />

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: table.getState().pagination.pageSize }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState {...defaultEmptyState} {...emptyState} />
        ) : (
          <div className="overflow-x-auto">
            <table role="table" className="w-full" aria-label="Data table">
              <thead className="bg-bg-secondary/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <ColumnHeader key={header.id} column={header.column} />
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer',
                      row.getIsSelected() && 'bg-accent-light/30 dark:bg-accent-muted/30',
                      !row.getIsSelected() && index % 2 === 0 && 'bg-bg-card',
                      !row.getIsSelected() && index % 2 !== 0 && 'bg-bg-secondary/30',
                      'hover:bg-bg-hover/50'
                    )}
                    role="row"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3.5 text-sm text-text-secondary"
                        role="gridcell"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && rows.length > 0 && <TablePagination table={table} />}
      </div>
    </div>
  )
}

export default DataTable
