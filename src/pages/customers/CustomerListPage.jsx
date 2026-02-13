import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { customerService } from '../../services/customer.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import CustomerModal from '../../components/modals/CustomerModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, EyeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'

const CustomerListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, refetch } = useApiQuery(customerService.getAll)

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('')
  }

  const customersData = useMemo(() => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.values)) return data.values
    return []
  }, [data])

  const filteredCustomers = useMemo(() => {
    let filtered = customersData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(lowerSearch) ||
          customer.email?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((customer) => customer.status === statusFilter)
    }

    return filtered
  }, [customersData, searchTerm, statusFilter])

  const handleRowClick = (row) => {
    navigate(`/customers/${row.original.key}`)
  }

  const handleCreateCustomer = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveCustomer = async (customerData) => {
    try {
      await customerService.create(customerData)
      showToast('Customer created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save customer', 'error')
    }
  }

  const handleCopyKey = async (e, customer) => {
    e.stopPropagation()
    if (!customer?.key) return
    try {
      await navigator.clipboard.writeText(customer.key)
      toast.success('Customer key copied to clipboard')
    } catch {
      toast.error('Failed to copy customer key')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredCustomers, columns, 'customers')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredCustomers, columns, 'Customers Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
            {customer.key && (
              <button
                type="button"
                onClick={(e) => handleCopyKey(e, customer)}
                className="block text-xs text-gray-400 dark:text-gray-500 truncate cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 mt-1"
                title="Click to copy customer key"
              >
                {customer.key}
              </button>
            )}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type
        const typeColors = {
          primary: 'bg-blue-600',
          subsidiary: 'bg-purple-600',
          division: 'bg-green-600',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
              typeColors[type] || 'bg-gray-600'
            }`}
          >
            {type || 'N/A'}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors = {
          active: 'bg-green-600',
          inactive: 'bg-red-600',
          archived: 'bg-gray-600',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
              statusColors[status] || 'bg-gray-600'
            }`}
          >
            {status || 'N/A'}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'contacts_count',
      header: 'Contacts',
      cell: ({ row }) => row.original.contacts_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'locations_count',
      header: 'Locations',
      cell: ({ row }) => row.original.locations_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatDate(row.original.created_at),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const customer = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/customers/${customer.key}`)
            }}
            className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )
      },
      enableSorting: false,
    },
  ]

  const hasActiveFilters = searchTerm || statusFilter

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                Customers
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your customers ({filteredCustomers.length} of {customersData.length || 0}{' '}
                total)
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refetch()}
                variant="secondary"
                className="inline-flex items-center"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleCreateCustomer} className="flex items-center gap-2">
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCustomers}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={false}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by name or email...',
            searchValue: searchInput,
            onSearchChange: handleSearchInputChange,
            advancedFilters: [
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'archived', label: 'Archived' },
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
        />

        {showCreateModal && (
          <CustomerModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveCustomer}
          />
        )}
      </div>
    </div>
  )
}

export default CustomerListPage
