import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { invoiceService } from '../../services/invoice.service'
import { customerService } from '../../services/customer.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import CreateInvoiceModal from '../../components/modals/CreateInvoiceModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, EyeIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'
import { useBusiness } from '../../hooks/useBusiness'
import { useAuth } from '../../hooks/useAuth'

const InvoiceListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { getCurrentRoles } = useBusiness()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  const currentRoles = getCurrentRoles()
  const isCustomer = currentRoles.includes('customer')
  const isManagerOrAbove = ['owner', 'manager'].some((role) => currentRoles.includes(role))

  const queryParams = useMemo(() => {
    const params = {}
    if (isCustomer && user?.customer_key) {
      params.customer_key = user.customer_key
    }
    if (statusFilter) {
      params.status = statusFilter
    }
    return params
  }, [isCustomer, user, statusFilter])

  const { data, isLoading, refetch } = useApiQuery(() => invoiceService.getAll(queryParams))
  const { data: customers = [] } = useApiQuery(customerService.getAll, {
    enabled: isManagerOrAbove,
  })

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

  const invoicesData = useMemo(() => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.values)) return data.values
    return []
  }, [data])

  const filteredInvoices = useMemo(() => {
    let filtered = invoicesData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.key?.toLowerCase().includes(lowerSearch) ||
          invoice.customer_name?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    return filtered
  }, [invoicesData, searchTerm, statusFilter])

  const handleRowClick = (row) => {
    navigate(`/invoices/${row.original.key}`)
  }

  const handleCreateInvoice = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveInvoice = async (invoiceData) => {
    try {
      await invoiceService.create(invoiceData)
      showToast('Invoice created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to create invoice', 'error')
    }
  }

  const handleBulkFinalize = async () => {
    showToast('Bulk finalize not implemented yet', 'info')
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredInvoices, columns, 'invoices')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredInvoices, columns, 'Invoices Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'key',
      header: 'Invoice Key',
      cell: ({ row }) => (
        <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {row.original.key}
        </code>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      enableSorting: true,
    },
    {
      accessorKey: 'period_start',
      header: 'Period',
      cell: ({ row }) => {
        const start = new Date(row.original.period_start)
        const end = new Date(row.original.period_end)
        return `${formatters.formatDate(start)} - ${formatters.formatDate(end)}`
      },
      enableSorting: true,
    },
    {
      accessorKey: 'subtotal',
      header: 'Subtotal',
      cell: ({ row }) => formatters.formatCurrency(row.original.subtotal || 0),
      enableSorting: true,
    },
    {
      accessorKey: 'tax',
      header: 'Tax',
      cell: ({ row }) => formatters.formatCurrency(row.original.tax || 0),
      enableSorting: true,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => formatters.formatCurrency(row.original.total || 0),
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) =>
        row.original.created_at
          ? formatters.formatDateTime(new Date(row.original.created_at))
          : 'N/A',
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/invoices/${invoice.key}`)
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

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'finalized', label: 'Finalized' },
    { value: 'paid', label: 'Paid' },
    { value: 'void', label: 'Void' },
    { value: 'overdue', label: 'Overdue' },
  ]

  return (
    <div data-testid="invoices-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                Invoices
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your invoices ({filteredInvoices.length} of {invoicesData.length || 0} total)
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
              {isManagerOrAbove && (
                <Button
                  onClick={handleCreateInvoice}
                  data-testid="create-invoice-button"
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredInvoices}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={isManagerOrAbove}
          onSelectionChange={setSelectedRows}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by invoice key or customer...',
            searchValue: searchInput,
            onSearchChange: handleSearchInputChange,
            advancedFilters: [
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                options: statusOptions,
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
          bulkActions={
            selectedRows.length > 0 && isManagerOrAbove ? (
              <div className="flex gap-2">
                <Button onClick={handleBulkFinalize} variant="outline" size="sm">
                  Finalize
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  Export
                </Button>
              </div>
            ) : null
          }
        />

        {showCreateModal && (
          <CreateInvoiceModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveInvoice}
            customers={customers}
          />
        )}
      </div>
    </div>
  )
}

export default InvoiceListPage
