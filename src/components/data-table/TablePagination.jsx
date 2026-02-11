import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Select from '../ui/Select'

const TablePagination = ({ table }) => {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalRows = table.getFilteredRowModel().rows.length
  const totalPages = table.getPageCount()

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalRows)} of{' '}
          {totalRows} results
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
          <Select
            value={pageSize}
            onChange={(value) => table.setPageSize(Number(value))}
            options={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
            className="w-20"
          />
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TablePagination
