import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getAll, create, update, remove } from '../../services/customer.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { validateRequired } from '../../utils/validators'
import { debounce } from 'lodash'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import DatePicker from '../../components/ui/DatePicker'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const CustomerListPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedDate, setSelectedDate] = useState(null)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data: customers = [], isLoading, refetch } = useApiQuery(getAll)

  useEffect(() => {
    document.title = 'OneVizn | Customers'
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 300000)
    return () => clearInterval(interval)
  }, [refetch])

  useEffect(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (selectedDate) params.date = formatters.formatDate(selectedDate)
    if (statusFilter) params.status = statusFilter
    setSearchParams(params, { replace: true })
  }, [searchTerm, selectedDate, statusFilter, setSearchParams])

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setSelectedDate(null)
    setStatusFilter('')
    setSearchParams({}, { replace: true })
  }

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
      await create(customerData)
      showToast('Customer created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save customer', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(selectedRows.map((row) => update(row.original.key, { status: newStatus })))
      showToast(
        `${selectedRows.length} customer${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update customer statuses', 'error')
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

  const handleDeleteClick = (e, customer) => {
    e.stopPropagation()
    setCustomerToDelete(customer)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return
    setDeleting(true)
    try {
      await remove(customerToDelete.key)
      toast.success('Customer deleted successfully')
      setShowDeleteDialog(false)
      setCustomerToDelete(null)
      refetch()
    } catch {
      toast.error('Failed to delete customer')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(customers, columns, 'customers')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(customers, columns, 'Customers Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const filteredCustomers = useMemo(() => {
    let filtered = customers
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
    if (selectedDate) {
      const dateStr = formatters.formatDate(selectedDate)
      filtered = filtered.filter((customer) => {
        try {
          const createdDate = new Date(customer.created_at)
          return formatters.formatDate(createdDate) === dateStr
        } catch {
          return false
        }
      })
    }
    return filtered
  }, [customers, searchTerm, statusFilter, selectedDate])

  const columns = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div>
            <span className="text-gray-900 dark:text-white font-medium hover:text-blue-600 cursor-pointer">
              {customer.name}
            </span>
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
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const type = getValue()
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
    },
    {
      accessorKey: 'contacts_count',
      header: 'Contacts',
      cell: ({ row }) => row.original.contacts_count || 0,
    },
    {
      accessorKey: 'locations_count',
      header: 'Locations',
      cell: ({ row }) => row.original.locations_count || 0,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => handleDeleteClick(e, customer)}>
              Delete
            </Button>
          </div>
        )
      },
      enableSorting: false,
    },
  ]

  const emptyState = {
    title: 'No customers found',
    description: 'Get started by creating your first customer.',
    action: {
      label: '+ New Customer',
      onClick: handleCreateCustomer,
    },
  }

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={() => handleBulkChangeStatus('active')} variant="outline" size="sm">
          Set Active
        </Button>
        <Button onClick={() => handleBulkChangeStatus('inactive')} variant="outline" size="sm">
          Set Inactive
        </Button>
        <Button onClick={() => handleBulkChangeStatus('archived')} variant="outline" size="sm">
          Archive
        </Button>
      </div>
    ) : null

  const hasActiveFilters = searchTerm || selectedDate || statusFilter

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your customer accounts ({customers.length} total)
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleCreateCustomer} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 min-w-0 relative">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
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
                      {[statusFilter, selectedDate].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>

              {showAdvancedDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Created Date
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="MM/dd/yyyy"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        isClearable
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <Button
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                variant="outline"
                className={!hasActiveFilters ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
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
                <span className="text-gray-600 dark:text-gray-400">Loading customers...</span>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {hasActiveFilters ? 'No customers match your filters' : 'No customers found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by creating a new customer.'}
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredCustomers}
              isLoading={isLoading}
              emptyState={emptyState}
              onRowClick={handleRowClick}
              enableSelection={true}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              bulkActions={bulkActions}
              onSelectionChange={setSelectedRows}
            />
          )}
        </div>
      </div>

      {showCreateModal && (
        <CustomerFormModal customer={null} onSave={handleSaveCustomer} onClose={handleCloseModal} />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setCustomerToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete Customer"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

const CustomerFormModal = ({ customer, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: customer
      ? {
          name: customer.name || '',
          type: customer.type || 'primary',
          status: customer.status || 'active',
        }
      : {
          name: '',
          type: 'primary',
          status: 'active',
        },
  })

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save customer', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!customer

  const typeOptions = [
    { value: 'primary', label: 'Primary' },
    { value: 'subsidiary', label: 'Subsidiary' },
    { value: 'division', label: 'Division' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Customer' : 'Create New Customer'}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  {...register('name', {
                    validate: (value) => validateField(value, 'Name'),
                  })}
                  error={errors.name?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <Select id="type" {...register('type')} options={typeOptions} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  id="status"
                  {...register('status', {
                    validate: (value) => validateField(value, 'Status'),
                  })}
                  error={errors.status?.message}
                  options={statusOptions}
                />
              </div>
            </div>
          </div>

          <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
        </form>
      </div>
    </div>
  )
}

export default CustomerListPage
