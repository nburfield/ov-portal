import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getAll } from '../../services/workorder.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { hasMinRole, ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { useBusiness } from '../../hooks/useBusiness'
import { ArrowPathIcon, PlusIcon, WrenchIcon } from '@heroicons/react/24/outline'

const WorkOrderListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { activeBusiness, getCurrentRoles } = useBusiness()
  const [selectedRows, setSelectedRows] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [recurringFilter, setRecurringFilter] = useState('')
  const currentRoles = getCurrentRoles()
  const isOwnerOrManager = hasMinRole(currentRoles, ROLES.MANAGER)
  const isCustomerRole = currentRoles.includes(ROLES.CUSTOMER)
  const isWorkerRole = currentRoles.includes(ROLES.WORKER)

  const queryParams = useMemo(() => {
    if (isCustomerRole && user?.customer_key) {
      return { customer_key: user.customer_key }
    } else if (isWorkerRole && activeBusiness?.business_key) {
      return { assigned_business_key: activeBusiness.business_key }
    }
    return {}
  }, [isCustomerRole, isWorkerRole, user, activeBusiness])

  const { data: workOrders = [], isLoading, refetch } = useApiQuery(() => getAll(queryParams))

  const handleRowClick = (row) => {
    navigate(`/workorders/${row.original.key}`)
  }

  const handleCreateWorkOrder = () => {
    navigate('/workorders/create')
  }

  const handleBulkChangeStatus = async (newStatus) => {
    showToast(`Bulk status change to ${newStatus} not implemented yet`, 'info')
    setSelectedRows([])
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredWorkOrders, columns, 'work_orders')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredWorkOrders, columns, 'Work Orders Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setRecurringFilter('')
  }

  const filteredWorkOrders = useMemo(() => {
    let filtered = workOrders

    if (statusFilter) {
      filtered = filtered.filter((workOrder) => workOrder.status === statusFilter)
    }

    if (recurringFilter) {
      filtered = filtered.filter((workOrder) =>
        recurringFilter === 'yes' ? workOrder.recurring : !workOrder.recurring
      )
    }

    return filtered
  }, [workOrders, statusFilter, recurringFilter])

  const columns = [
    {
      accessorKey: 'key',
      header: 'Key',
      cell: ({ row }) => <code className="font-mono text-sm">{row.original.key}</code>,
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'service_name',
      header: 'Service',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'location_address',
      header: 'Location',
      cell: ({ row }) => row.original.location_address || '',
      filterFn: 'includesString',
    },
    {
      accessorKey: 'assigned_business_name',
      header: 'Assigned To',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => formatters.formatDate(new Date(row.original.start_date)),
      enableSorting: true,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => formatters.formatCurrency(row.original.price || 0),
      enableSorting: true,
    },
    {
      accessorKey: 'recurring',
      header: 'Recurring',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
            row.original.recurring ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          {row.original.recurring ? 'Yes' : 'No'}
        </span>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.recurring === (filterValue === 'yes')
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors = {
          active: 'bg-green-600',
          paused: 'bg-yellow-600',
          cancelled: 'bg-gray-600',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
              statusColors[status] || 'bg-gray-600'
            }`}
          >
            {status}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/workorders/${row.original.key}/edit`)
          }}
          className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      ),
      enableSorting: false,
    },
  ]

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={() => handleBulkChangeStatus('active')} variant="outline" size="sm">
          Set Active
        </Button>
        <Button onClick={() => handleBulkChangeStatus('paused')} variant="outline" size="sm">
          Set Paused
        </Button>
        <Button onClick={() => handleBulkChangeStatus('cancelled')} variant="outline" size="sm">
          Set Cancelled
        </Button>
      </div>
    ) : null

  const hasActiveFilters = statusFilter || recurringFilter

  return (
    <div data-testid="work-orders-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <WrenchIcon className="h-8 w-8 text-blue-600" />
                Work Orders
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your work orders ({filteredWorkOrders.length} of {workOrders.length || 0}{' '}
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
              {isOwnerOrManager && (
                <Button onClick={handleCreateWorkOrder} className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Work Order
                </Button>
              )}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredWorkOrders}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={true}
          bulkActions={bulkActions}
          onSelectionChange={setSelectedRows}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by key, customer, service, or location...',
            advancedFilters: [
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
              {
                id: 'recurring',
                label: 'Recurring',
                value: recurringFilter,
                onChange: (e) => setRecurringFilter(e.target.value),
                options: [
                  { value: '', label: 'All Types' },
                  { value: 'yes', label: 'Recurring' },
                  { value: 'no', label: 'One-Time' },
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
        />
      </div>
    </div>
  )
}

export default WorkOrderListPage
