import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { useBusiness } from '../../hooks/useBusiness'
import { getAll } from '../../services/workorder.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { hasMinRole, ROLES } from '../../constants/roles'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'

const WorkOrderListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { activeBusiness, getCurrentRoles } = useBusiness()
  const [selectedRows, setSelectedRows] = useState([])
  const [quickFilter, setQuickFilter] = useState('')

  const currentRoles = getCurrentRoles()
  const isOwnerOrManager = hasMinRole(currentRoles, ROLES.MANAGER)

  // Determine query params based on role
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

  const { data: workOrders = [], isLoading } = useApiQuery(() => getAll(queryParams))

  const handleRowClick = (row) => {
    navigate(`/workorders/${row.original.key}`)
  }

  const handleCreateWorkOrder = () => {
    navigate('/workorders/create')
  }

  const handleBulkChangeStatus = async (newStatus) => {
    // TODO: Implement bulk status change
    showToast(`Bulk status change to ${newStatus} not implemented yet`, 'info')
    setSelectedRows([])
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(workOrders, columns, 'work_orders')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(workOrders, columns, 'Work Orders Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const handleQuickFilter = (filter) => {
    setQuickFilter(filter)
  }

  // Apply quick filters
  const filteredWorkOrders = useMemo(() => {
    if (!quickFilter) return workOrders

    return workOrders.filter((workOrder) => {
      switch (quickFilter) {
        case 'active':
          return workOrder.status === 'active'
        case 'paused':
          return workOrder.status === 'paused'
        case 'cancelled':
          return workOrder.status === 'cancelled'
        case 'recurring':
          return workOrder.recurring
        case 'one-time':
          return !workOrder.recurring
        default:
          return true
      }
    })
  }, [workOrders, quickFilter])

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
        <Badge status={row.original.recurring ? 'success' : 'default'}>
          {row.original.recurring ? 'Yes' : 'No'}
        </Badge>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.recurring === (filterValue === 'yes')
      },
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/workorders/${row.original.key}/edit`)
            }}
            className="flex items-center gap-1"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>
      ),
      enableSorting: false,
      enableResizing: false,
    },
  ]

  const emptyState = {
    title: 'No work orders found',
    description: isCustomerRole
      ? 'You have no work orders yet.'
      : 'Get started by creating your first work order.',
    action: isOwnerOrManager
      ? {
          label: '+ New Work Order',
          onClick: handleCreateWorkOrder,
        }
      : null,
  }

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

  const quickFilterButtons = [
    { key: '', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'recurring', label: 'Recurring Only' },
    { key: 'one-time', label: 'One-Time Only' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        {isOwnerOrManager && (
          <Button onClick={handleCreateWorkOrder} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />+ New Work Order
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        {quickFilterButtons.map((filter) => (
          <Button
            key={filter.key}
            variant={quickFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredWorkOrders}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
        enableSelection={true}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        bulkActions={bulkActions}
        onSelectionChange={setSelectedRows}
        initialColumnFilters={[
          {
            id: 'status',
            value: '',
          },
        ]}
      />
    </div>
  )
}

export default WorkOrderListPage
