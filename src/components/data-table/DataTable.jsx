import React from 'react'
import { flexRender } from '@tanstack/react-table'
import { cn } from '../../utils/cn'
import { useDataTable } from '../../hooks/useDataTable'
import ColumnHeader from './ColumnHeader'
import TableToolbar from './TableToolbar'
import TablePagination from './TablePagination'
import Skeleton from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

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
}) => {
  const selectColumn = enableSelection
    ? {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300 dark:border-gray-600"
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 dark:border-gray-600"
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        size: 50,
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
    initialGlobalFilter,
    enableSelection,
  })

  const { rows } = table.getRowModel()

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
      <TableToolbar
        table={table}
        globalFilter={table.getState().globalFilter}
        setGlobalFilter={table.setGlobalFilter}
      />
      {isLoading ? (
        <div className="p-4">
          <Skeleton variant="SkeletonRow" count={table.getState().pagination.pageSize} />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState {...emptyState} />
      ) : (
        <div className="overflow-auto">
          <table
            role="table"
            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            aria-label="Data table"
          >
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <ColumnHeader key={header.id} column={header.column} />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-800',
                    onRowClick && 'cursor-pointer'
                  )}
                  role="row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
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
  )
}

export default DataTable
