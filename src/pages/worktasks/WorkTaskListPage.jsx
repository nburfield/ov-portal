import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useAuth } from '../../hooks/useAuth'
import { useBusiness } from '../../hooks/useBusiness'
import { getAll } from '../../services/worktask.service'
import { DataTable } from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { hasMinRole, ROLES } from '../../constants/roles'
import { PlusIcon } from '@heroicons/react/24/outline'

const WorkTaskListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { getCurrentRoles } = useBusiness()
  const [selectedRows, setSelectedRows] = useState([])
  const [quickFilter, setQuickFilter] = useState('')

  const currentRoles = getCurrentRoles()
  const isOwnerOrManager = hasMinRole(currentRoles, ROLES.MANAGER)
  const isWorker = currentRoles.includes(ROLES.WORKER)

  // Determine query params based on role
  const queryParams = useMemo(() => {
    if (isWorker && user?.key) {
      return { worker_key: user.key }
    }
    return {}
  }, [isWorker, user?.key])

  const { data: workTasks = [], isLoading } = useApiQuery(() => getAll(queryParams))

  const handleRowClick = (row) => {
    navigate(`/worktasks/${row.original.key}`)
  }

  const handleCreateWorkTask = () => {
    navigate('/worktasks/create')
  }

  const handleBulkExport = () => {
    try {
      exportToCSV(workTasks, columns, 'work_tasks')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleQuickFilter = (filter) => {
    setQuickFilter(filter)
  }

  // Apply quick filters
  const filteredWorkTasks = useMemo(() => {
    if (!quickFilter) return workTasks

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    return workTasks.filter((workTask) => {
      const performedAt = new Date(workTask.performed_at)

      switch (quickFilter) {
        case 'completed':
          return workTask.status === 'completed'
        case 'missed':
          return workTask.status === 'missed'
        case 'cancelled':
          return workTask.status === 'cancelled'
        case 'today':
          return performedAt >= startOfToday
        case 'this_week':
          return performedAt >= startOfWeek
        default:
          return true
      }
    })
  }, [workTasks, quickFilter])

  const columns = [
    {
      accessorKey: 'work_order_key',
      header: 'Work Order',
      cell: ({ row }) => <code className="font-mono text-sm">{row.original.work_order_key}</code>,
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'worker_name',
      header: 'Worker',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'service_snapshot.name',
      header: 'Service',
      cell: ({ row }) => row.original.service_snapshot?.name || '',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'performed_at',
      header: 'Performed At',
      cell: ({ row }) => formatters.formatDateTime(new Date(row.original.performed_at)),
      enableSorting: true,
    },
    {
      accessorKey: 'price_snapshot',
      header: 'Price',
      cell: ({ row }) => formatters.formatCurrency(row.original.price_snapshot || 0),
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
      accessorKey: 'photos_count',
      header: 'Photos Count',
      cell: ({ row }) => row.original.photos_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'assets_used_count',
      header: 'Assets Used',
      cell: ({ row }) => row.original.assets_used_count || 0,
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No work tasks found',
    description: isWorker
      ? 'You have no work tasks yet.'
      : 'Get started by logging your first work task.',
    action: isOwnerOrManager
      ? {
          label: '+ Log Work Task',
          onClick: handleCreateWorkTask,
        }
      : null,
  }

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={handleBulkExport} variant="outline" size="sm">
          Export Selected
        </Button>
      </div>
    ) : null

  const quickFilterButtons = [
    { key: '', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'missed', label: 'Missed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Tasks</h1>
        {isOwnerOrManager && (
          <Button onClick={handleCreateWorkTask} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />+ Log Work Task
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
        data={filteredWorkTasks}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
        enableSelection={true}
        onExportCSV={() => exportToCSV(filteredWorkTasks, columns, 'work_tasks')}
        onExportPDF={() => exportToPDF(filteredWorkTasks, columns, 'Work Tasks Report')}
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

export default WorkTaskListPage
