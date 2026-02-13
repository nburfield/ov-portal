import React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Select from '../ui/Select'

const TablePagination = ({ table }) => {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalRows = table.getFilteredRowModel().rows.length
  const totalPages = table.getPageCount()

  const startPage = Math.max(0, pageIndex - 2)
  const endPage = Math.min(totalPages - 1, pageIndex + 2)
  const pageNumbers = []
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  const showingStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const showingEnd = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg-secondary/50">
      <div className="flex items-center gap-2">
        <span data-testid="pagination-info" className="text-sm text-text-secondary">
          Showing <span className="font-medium">{showingStart}</span> to{' '}
          <span className="font-medium">{showingEnd}</span> of{' '}
          <span className="font-medium">{totalRows}</span> results
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Rows per page:</span>
          <Select
            data-testid="pagination-page-size"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            options={[
              { value: 10, label: '10' },
              { value: 25, label: '25' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
            className="w-20"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            data-testid="pagination-prev"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={page === pageIndex ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => table.setPageIndex(page)}
                className="w-8 h-8 p-0"
              >
                {page + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            data-testid="pagination-next"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2"
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TablePagination
