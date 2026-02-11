import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'

export function useDataTable({
  data,
  columns,
  initialSorting = [],
  initialPagination = { pageIndex: 0, pageSize: 10 },
  initialColumnVisibility = {},
  initialColumnFilters = [],
  initialGlobalFilter = '',
  enableSelection = true,
}) {
  const [sorting, setSorting] = useState(initialSorting)
  const [pagination, setPagination] = useState(initialPagination)
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility)
  const [columnFilters, setColumnFilters] = useState(initialColumnFilters)
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Sorting
    enableSorting: true,
    enableMultiSort: true,
    onSortingChange: setSorting,
    // Pagination
    enablePagination: true,
    onPaginationChange: setPagination,
    // Row selection
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    // Column visibility
    enableColumnVisibility: true,
    onColumnVisibilityChange: setColumnVisibility,
    // Filters
    enableFilters: true,
    enableGlobalFilter: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    // Column resizing
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    // State
    state: {
      sorting,
      pagination,
      columnVisibility,
      columnFilters,
      globalFilter,
      rowSelection,
    },
  })

  return table
}
