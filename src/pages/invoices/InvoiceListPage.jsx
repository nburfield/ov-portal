import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { useBusiness } from '../../hooks/useBusiness'
import { getAll, create } from '../../services/invoice.service'
import { getAll as getAllCustomers } from '../../services/customer.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import DatePicker from '../../components/ui/DatePicker'
import SlideOver from '../../components/ui/SlideOver'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { validateRequired } from '../../utils/validators'
import { PlusIcon } from '@heroicons/react/24/outline'

const InvoiceListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { getCurrentRoles } = useBusiness()
  const [showCreateSlideOver, setShowCreateSlideOver] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [statusFilter, setStatusFilter] = useState('')

  const currentRoles = getCurrentRoles()
  const isCustomer = currentRoles.includes('customer')
  const isManagerOrAbove = ['owner', 'manager'].some((role) => currentRoles.includes(role))

  // Get query params for API
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

  const { data: invoices = [], isLoading, refetch } = useApiQuery(() => getAll(queryParams))
  const { data: customers = [] } = useApiQuery(getAllCustomers, { enabled: isManagerOrAbove })

  const handleRowClick = (row) => {
    navigate(`/invoices/${row.original.key}`)
  }

  const handleCreateInvoice = () => {
    setShowCreateSlideOver(true)
  }

  const handleCloseSlideOver = () => {
    setShowCreateSlideOver(false)
  }

  const handleSaveInvoice = async (invoiceData) => {
    try {
      await create(invoiceData)
      showToast('Invoice created successfully', 'success')
      refetch()
      handleCloseSlideOver()
    } catch {
      showToast('Failed to save invoice', 'error')
    }
  }

  const handleBulkFinalize = async () => {
    // TODO: Implement bulk finalize
    showToast('Bulk finalize not implemented yet', 'info')
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(invoices, columns, 'invoices')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(invoices, columns, 'Invoices Report')
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
        <code className="rounded bg-bg-tertiary px-1 py-0.5 text-xs">{row.original.key}</code>
      ),
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.customer_name?.toLowerCase().includes(filterValue.toLowerCase())
      },
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
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.status === filterValue
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No invoices found',
    description: 'Get started by creating your first invoice.',
    action: isManagerOrAbove
      ? {
          label: '+ New Invoice',
          onClick: handleCreateInvoice,
        }
      : undefined,
  }

  const quickFilters = (
    <div data-testid="filter-status" className="flex gap-2">
      {['Draft', 'Finalized', 'Paid', 'Void', 'Overdue'].map((status) => (
        <Button
          key={status}
          variant={statusFilter === status.toLowerCase() ? 'default' : 'outline'}
          size="sm"
          data-testid={`filter-${status.toLowerCase()}`}
          onClick={() =>
            setStatusFilter(statusFilter === status.toLowerCase() ? '' : status.toLowerCase())
          }
        >
          {status}
        </Button>
      ))}
    </div>
  )

  const bulkActions =
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

  return (
    <div data-testid="invoices-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        {isManagerOrAbove && (
          <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />+ New Invoice
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quick Filters:</span>
        {quickFilters}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
        enableSelection={isManagerOrAbove}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        bulkActions={bulkActions}
        onSelectionChange={setSelectedRows}
      />

      {/* Create SlideOver */}
      {showCreateSlideOver && (
        <CreateInvoiceSlideOver
          customers={customers}
          onSave={handleSaveInvoice}
          onClose={handleCloseSlideOver}
        />
      )}
    </div>
  )
}

const CreateInvoiceSlideOver = ({ customers, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      customer_key: '',
      period_start: '',
      period_end: '',
      tax: 0.0,
      status: 'draft',
    },
  })

  const periodStart = watch('period_start')

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const validatePeriodEnd = (value) => {
    if (!periodStart || !value) return
    if (new Date(value) <= new Date(periodStart)) {
      return 'Period end must be after period start'
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save invoice', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const customerOptions = customers.map((customer) => ({
    value: customer.key,
    label: customer.name,
  }))

  return (
    <SlideOver
      isOpen={true}
      onClose={onClose}
      data-testid="invoice-slideover"
      title="Create Invoice"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer */}
        <div>
          <label
            htmlFor="customer_key"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Customer <span className="text-danger">*</span>
          </label>
          <Select
            id="customer_key"
            {...register('customer_key', {
              validate: (value) => validateField(value, 'Customer'),
            })}
            error={errors.customer_key?.message}
            options={customerOptions}
            placeholder="Select a customer"
          />
        </div>

        {/* Period Start */}
        <DatePicker
          data-testid="inv-date-input"
          label="Period Start"
          {...register('period_start', {
            validate: (value) => validateField(value, 'Period Start'),
          })}
          error={errors.period_start?.message}
          required
        />

        {/* Period End */}
        <DatePicker
          data-testid="inv-due-date-input"
          label="Period End"
          {...register('period_end', {
            validate: (value) => {
              const requiredError = validateField(value, 'Period End')
              if (requiredError) return requiredError
              return validatePeriodEnd(value)
            },
          })}
          error={errors.period_end?.message}
          min={periodStart}
          required
        />

        {/* Tax */}
        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-text-primary mb-1">
            Tax
          </label>
          <Input id="tax" type="number" step="0.01" {...register('tax')} placeholder="0.00" />
        </div>

        {/* Status - Hidden, always draft */}
        <input type="hidden" {...register('status')} value="draft" />

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </SlideOver>
  )
}

export default InvoiceListPage
