import React, { useEffect, useState } from 'react'
import { flexRender } from '@tanstack/react-table'
import { cn } from '../../utils/cn'
import { useDataTable } from '../../hooks/useDataTable'
import ColumnHeader from './ColumnHeader'
import TableToolbar from './TableToolbar'
import TablePagination from './TablePagination'
import BulkActions from './BulkActions'
import ExportButton from './ExportButton'
import DataTableFilterBar from './DataTableFilterBar'
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
  filterBar,
}) => {
  const useExternalFilterBar = !!filterBar
  const [globalFilter, setGlobalFilter] = useState(useExternalFilterBar ? '' : initialGlobalFilter)

  const selectColumn = enableSelection
    ? {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-border bg-bg-card text-accent focus:ring-accent/20"
            data-testid="table-select-all"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-border bg-bg-card text-accent focus:ring-accent/20"
            data-testid={`table-row-select-${row.index}`}
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
    initialGlobalFilter: useExternalFilterBar ? '' : globalFilter,
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
    rounded: 'rounded-xl',
    bordered: 'border border-border rounded-xl',
  }

  const defaultEmptyState = {
    icon: MagnifyingGlassIcon,
    title: 'No data found',
    description: 'Try adjusting your search or filter criteria',
  }

  const rootClassName = useExternalFilterBar ? 'space-y-4' : cn('space-y-4', className)
  const tableCardClassName = useExternalFilterBar ? cn('overflow-hidden', variants[variant], className) : cn('overflow-hidden', variants[variant])

  return (
    <div className={rootClassName}>
      {filterBar && (
        <DataTableFilterBar
          searchPlaceholder={filterBar.searchPlaceholder}
          searchValue={filterBar.searchValue}
          onSearchChange={filterBar.onSearchChange}
          advancedFilters={filterBar.advancedFilters}
          onClearFilters={filterBar.onClearFilters}
          hasActiveFilters={filterBar.hasActiveFilters}
          onExportCSV={filterBar.onExportCSV}
          onExportPDF={filterBar.onExportPDF}
          table={table}
          className={filterBar.className}
        />
      )}

      {selectedCount > 0 && (
        <div data-testid="bulk-actions">
          <BulkActions
            selectedCount={selectedCount}
            totalCount={totalCount}
            onSelectAll={table.getToggleAllRowsSelectedHandler()}
            onClearSelection={() => table.toggleAllRowsSelected(false)}
          >
            {bulkActions}
            <ExportButton onExportCSV={onExportCSV} onExportPDF={onExportPDF} />
          </BulkActions>
        </div>
      )}

      {!useExternalFilterBar && (
        <div data-testid="data-table-toolbar" className={cn('overflow-hidden', variants[variant])}>
          <TableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            onExportCSV={onExportCSV}
            onExportPDF={onExportPDF}
            hideSearch={false}
            hideExport={false}
            hideColumns={false}
          />
        </div>
      )}

      <div data-testid="data-table" className={tableCardClassName}>
        {isLoading ? (
          <div data-testid="table-loading">
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
          </div>
        ) : rows.length === 0 ? (
          <div data-testid="table-empty-state">
            <EmptyState {...defaultEmptyState} {...emptyState} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table role="table" className="w-full" aria-label="Data table">
              <thead data-testid="table-head" className="bg-bg-secondary/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <ColumnHeader key={header.id} column={header.column} />
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody data-testid="table-body" className="divide-y divide-border">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    data-testid={`table-row-${index}`}
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

        {!isLoading && rows.length > 0 && (
          <div data-testid="table-pagination">
            <TablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable
