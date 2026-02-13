import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { worktaskService } from '../../services/worktask.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { hasMinRole, ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { useBusiness } from '../../hooks/useBusiness'
import { ClipboardDocumentCheckIcon, ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

const WorkTaskListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { getCurrentRoles } = useBusiness()
  const [selectedRows, setSelectedRows] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const currentRoles = getCurrentRoles()
  const isOwnerOrManager = hasMinRole(currentRoles, ROLES.MANAGER)
  const isWorker = currentRoles.includes(ROLES.WORKER)

  const queryParams = useMemo(() => {
    const params = {}
    if (isWorker && user?.key) {
      params.worker_key = user.key
    }
    return params
  }, [isWorker, user])

  const {
    data: workTasks = [],
    isLoading,
    refetch,
  } = useApiQuery(() => worktaskService.getAll(queryParams), { key: ['worktasks', queryParams] })

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
    setDateFilter('')
  }

  const workTasksData = useMemo(() => {
    if (Array.isArray(workTasks)) return workTasks
    if (Array.isArray(workTasks?.values)) return workTasks.values
    return []
  }, [workTasks])

  const filteredWorkTasks = useMemo(() => {
    let filtered = workTasksData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.work_order_key?.toLowerCase().includes(lowerSearch) ||
          task.worker_name?.toLowerCase().includes(lowerSearch) ||
          task.service_snapshot?.name?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (dateFilter) {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

      filtered = filtered.filter((task) => {
        const performedAt = new Date(task.performed_at)
        switch (dateFilter) {
          case 'today':
            return performedAt >= startOfToday
          case 'this_week':
            return performedAt >= startOfWeek
          default:
            return true
        }
      })
    }

    return filtered
  }, [workTasksData, searchTerm, statusFilter, dateFilter])

  const handleRowClick = (row) => {
    navigate(`/worktasks/${row.original.key}`)
  }

  const handleCreateWorkTask = () => {
    navigate('/worktasks/create')
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredWorkTasks, columns, 'work_tasks')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredWorkTasks, columns, 'Work Tasks Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'work_order_key',
      header: 'Work Order',
      cell: ({ row }) => (
        <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {row.original.work_order_key}
        </code>
      ),
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
      header: 'Photos',
      cell: ({ row }) => row.original.photos_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'assets_used_count',
      header: 'Assets',
      cell: ({ row }) => row.original.assets_used_count || 0,
      enableSorting: true,
    },
  ]

  const hasActiveFilters = searchTerm || statusFilter || dateFilter

  return (
    <div data-testid="worktasks-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-600" />
                Work Tasks
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your work tasks ({filteredWorkTasks.length} of {workTasksData.length || 0}{' '}
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
                <Button onClick={handleCreateWorkTask} className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Log Work Task
                </Button>
              )}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredWorkTasks}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={true}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by work order, worker, or service...',
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
                  { value: 'completed', label: 'Completed' },
                  { value: 'missed', label: 'Missed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
              {
                id: 'date',
                label: 'Date',
                value: dateFilter,
                onChange: (e) => setDateFilter(e.target.value),
                options: [
                  { value: '', label: 'All Dates' },
                  { value: 'today', label: 'Today' },
                  { value: 'this_week', label: 'This Week' },
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
          bulkActions={
            selectedRows.length > 0 ? (
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  Export Selected
                </Button>
              </div>
            ) : null
          }
          onSelectionChange={setSelectedRows}
          initialColumnFilters={[
            {
              id: 'status',
              value: '',
            },
          ]}
        />
      </div>
    </div>
  )
}

export default WorkTaskListPage
