// src/pages/businesses/BusinessList.jsx
import React, { useEffect, useState, useContext, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import { AuthContext } from '../../context/AuthContext'
import { format, parseISO } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { debounce } from 'lodash'
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Tooltip } from 'react-tooltip'
import toast from 'react-hot-toast'
import NewBusinessModal from '../../components/modals/NewBusinessModal'

class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-gray-500">Something went wrong rendering the business list.</div>
      )
    }
    return this.props.children
  }
}

export default function BusinessList() {
  const [searchParams, setSearchParams] = useSearchParams()
  // Contexts
  const { isGlobalAdmin } = useContext(AuthContext)
  const {
    businesses = [],
    loading: businessesLoading,
    fetchBusinesses,
    deleteBusiness,
  } = useBusiness()
  // State
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedDate, setSelectedDate] = useState(null)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [businessToDelete, setBusinessToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false)
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false)

  // Load date from localStorage
  useEffect(() => {
    const storedDate = localStorage.getItem('businessListSelectedDate')
    if (storedDate) {
      setSelectedDate(parseISO(storedDate))
    }
  }, [])

  // Fetch businesses on mount
  useEffect(() => {
    document.title = 'Alliance Forge | Business Management'
    console.log(`[BusinessList] Fetching businesses on mount:`, {
      timestamp: new Date().toISOString(),
    })
    fetchBusinesses()
  }, [fetchBusinesses])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`[BusinessList] Auto-refreshing businesses:`, {
        timestamp: new Date().toISOString(),
      })
      fetchBusinesses()
    }, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [fetchBusinesses])

  // Update URL params
  useEffect(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (selectedDate) params.date = format(selectedDate, 'yyyy-MM-dd')
    if (statusFilter) params.status = statusFilter
    if (typeFilter) params.type = typeFilter
    setSearchParams(params, { replace: true })
  }, [searchTerm, selectedDate, statusFilter, typeFilter, setSearchParams])

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  // Save date to localStorage
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate)
    if (newDate) {
      localStorage.setItem('businessListSelectedDate', format(newDate, 'yyyy-MM-dd'))
    } else {
      localStorage.removeItem('businessListSelectedDate')
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setSelectedDate(null)
    setStatusFilter('')
    setTypeFilter('')
    localStorage.removeItem('businessListSelectedDate')
    setSearchParams({}, { replace: true })
  }

  // Filtered businesses
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses
    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (business) =>
          business.name?.toLowerCase().includes(lowerSearch) ||
          business.primary_contact_name?.toLowerCase().includes(lowerSearch) ||
          business.primary_contact_email?.toLowerCase().includes(lowerSearch)
      )
    }
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((business) => business.status === statusFilter)
    }
    // Type filter
    if (typeFilter) {
      filtered = filtered.filter((business) => business.business_type === typeFilter)
    }
    // Date filter (created date)
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      filtered = filtered.filter((business) => {
        try {
          const createdDate = new Date(business.created_dt * 1000)
          return format(createdDate, 'yyyy-MM-dd') === dateStr
        } catch {
          return false
        }
      })
    }
    return filtered
  }, [businesses, searchTerm, statusFilter, typeFilter, selectedDate])

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Business Name',
        cell: ({ row }) => {
          const business = row.original
          const handleCopyKey = async (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!business.key) return
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(business.key)
              } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea')
                textArea.value = business.key
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
              }
              setTimeout(() => {
                toast.success('Business key copied to clipboard')
              }, 0)
            } catch (err) {
              console.error('Failed to copy business key:', err)
              toast.error('Failed to copy business key')
            }
          }
          return (
            <div>
              <Link
                to={`/businesses/view/${business.key}`}
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium cursor-pointer"
              >
                {business.name}
              </Link>
              {business.key && (
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="block text-xs text-gray-400 dark:text-gray-500 truncate cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none mt-1"
                  title="Click to copy business key"
                >
                  {business.key}
                </button>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'business_type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue()
          const typeColors = {
            individual: 'bg-blue-600',
            enterprise: 'bg-purple-600',
            polling: 'bg-gray-600',
            affiliate: 'bg-green-600',
          }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
                typeColors[type] || 'bg-gray-600'
              }`}
            >
              {type}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue()
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
                status === 'active' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {status}
            </span>
          )
        },
      },
      {
        accessorKey: 'primary_contact_name',
        header: 'Contact',
        cell: ({ row }) => {
          const business = row.original
          const contact = business.primary_contact_name
          const email = business.primary_contact_email
          return (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{contact || 'N/A'}</div>
              {email && (
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                  {email}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'created_dt',
        header: 'Created',
        cell: ({ getValue }) => {
          const createdDt = getValue()
          return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {createdDt ? format(new Date(createdDt * 1000), 'MMM dd, yyyy') : 'N/A'}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const business = row.original
          return (
            <Link
              to={`/businesses/view/${business.key}`}
              data-tooltip-id="view-business-tooltip"
              data-tooltip-content="View Business"
              className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
          )
        },
        enableSorting: false,
      },
    ],
    []
  )

  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  })

  const table = useReactTable({
    data: filteredBusinesses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    if (!businessToDelete) return
    setDeleting(true)
    try {
      console.log(`[BusinessList] Deleting business:`, {
        key: businessToDelete.key,
        timestamp: new Date().toISOString(),
      })
      await deleteBusiness(businessToDelete.key)
      console.log(`[BusinessList] Deleted business:`, {
        key: businessToDelete.key,
        timestamp: new Date().toISOString(),
      })
      setShowDeleteConfirm(false)
      setBusinessToDelete(null)
    } catch (err) {
      console.error('[BusinessList] Delete failed:', err)
    } finally {
      setDeleting(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdvancedDropdown && !event.target.closest('.advanced-filter-dropdown')) {
        setShowAdvancedDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAdvancedDropdown])

  // Role guard
  if (!isGlobalAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              Business management is available only to Global Administrators.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasActiveFilters = searchTerm || selectedDate || statusFilter || typeFilter

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Businesses
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your business accounts ({businesses.length} total)
              </p>
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowNewBusinessModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Business
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Search with Advanced Dropdown */}
            <div className="flex-1 min-w-0 relative advanced-filter-dropdown">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, contact, or email..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAdvancedDropdown(!showAdvancedDropdown)}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FunnelIcon className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                      {[searchTerm, statusFilter, typeFilter, selectedDate].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Advanced Filters Dropdown */}
              {showAdvancedDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="individual">Individual</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="polling">Polling</option>
                        <option value="affiliate">Affiliate</option>
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Created Date
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholderText="Select date"
                        isClearable
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !hasActiveFilters ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Clear
              </button>
              <button
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  businessesLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={fetchBusinesses}
                disabled={businessesLoading}
              >
                {businessesLoading ? (
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredBusinesses.length} of {businesses.length} businesses
          </p>
        </div>

        {/* Businesses Table */}
        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {businessesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400">Loading businesses...</span>
                </div>
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {hasActiveFilters ? 'No businesses match your filters' : 'No businesses found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {hasActiveFilters
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by creating a new business.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                              header.column.getCanSort()
                                ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200'
                                : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center space-x-1">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && (
                                <span className="text-blue-600">
                                  {header.column.getIsSorted() === 'asc' ? (
                                    <ArrowUpIcon className="h-4 w-4" />
                                  ) : header.column.getIsSorted() === 'desc' ? (
                                    <ArrowDownIcon className="h-4 w-4" />
                                  ) : (
                                    <ArrowsUpDownIcon className="h-4 w-4" />
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-2 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ErrorBoundary>

        {/* Pagination */}
        {!businessesLoading && filteredBusinesses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Page size selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value))
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
              </div>

              {/* Pagination info */}
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
                to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  filteredBusinesses.length
                )}{' '}
                of {filteredBusinesses.length} results
              </div>

              {/* Pagination controls */}
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-1">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {(() => {
                  const totalPages = table.getPageCount()
                  const currentPage = table.getState().pagination.pageIndex + 1
                  const pages = []
                  const maxVisiblePages = 5

                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1)
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => table.setPageIndex(i - 1)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          i === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {i}
                      </button>
                    )
                  }

                  return pages
                })()}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowDeleteConfirm(false)}
              ></div>
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Confirm Delete
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Are you sure you want to delete <strong>{businessToDelete?.name}</strong>?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      onClick={handleDeleteConfirm}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Tooltip id="view-business-tooltip" />

      {/* New Business Modal */}
      <NewBusinessModal
        isOpen={showNewBusinessModal}
        onClose={() => setShowNewBusinessModal(false)}
        onSuccess={(business) => {
          console.log('[BusinessList] Business created:', business)
          toast.success('Business created successfully.')
          // Refresh businesses list
          fetchBusinesses()
        }}
      />
    </div>
  )
}
