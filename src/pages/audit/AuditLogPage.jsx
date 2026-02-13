import React, { useState, useMemo } from 'react'
import { useBusiness } from '../../hooks/useBusiness'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getAuditLogs } from '../../services/audit.service'
import DataTable from '../../components/data-table/DataTable'
import Badge from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import DatePicker from '../../components/ui/DatePicker'
import AuditLogDetailsModal from '../../components/modals/AuditLogDetailsModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { debounce } from 'lodash'

const AuditLogPage = () => {
  const { activeBusiness } = useBusiness()
  const { showToast } = useToast()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 7))
  const [dateTo, setDateTo] = useState(new Date())

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  const {
    data: auditLogs = [],
    isLoading,
    refetch,
  } = useApiQuery(() => {
    if (!activeBusiness) return Promise.resolve([])
    return getAuditLogs({
      business_key: activeBusiness.business_key,
      from: startOfDay(dateFrom).toISOString(),
      to: endOfDay(dateTo).toISOString(),
    })
  }, [activeBusiness?.business_key, dateFrom, dateTo])

  const auditLogsData = useMemo(() => {
    if (Array.isArray(auditLogs)) return auditLogs
    if (Array.isArray(auditLogs?.values)) return auditLogs.values
    return []
  }, [auditLogs])

  const filteredLogs = useMemo(() => {
    let filtered = auditLogsData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.actor?.toLowerCase().includes(lowerSearch) ||
          log.resource_type?.toLowerCase().includes(lowerSearch) ||
          log.resource_key?.toLowerCase().includes(lowerSearch) ||
          log.event_type?.toLowerCase().includes(lowerSearch) ||
          log.action?.toLowerCase().includes(lowerSearch)
      )
    }

    if (eventTypeFilter) {
      filtered = filtered.filter((log) => log.event_type === eventTypeFilter)
    }

    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    if (resourceFilter) {
      filtered = filtered.filter((log) => log.resource_type === resourceFilter)
    }

    return filtered
  }, [auditLogsData, searchTerm, eventTypeFilter, actionFilter, resourceFilter])

  const handleViewDetails = (row) => {
    setSelectedLog(row.original)
  }

  const handleCloseModal = () => {
    setSelectedLog(null)
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredLogs, columns, 'audit-logs')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredLogs, columns, 'Audit Logs Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setEventTypeFilter('')
    setActionFilter('')
    setResourceFilter('')
  }

  const handleDateFromChange = (e) => {
    setDateFrom(new Date(e.target.value))
  }

  const handleDateToChange = (e) => {
    setDateTo(new Date(e.target.value))
  }

  const hasActiveFilters = searchTerm || eventTypeFilter || actionFilter || resourceFilter

  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => formatters.formatDateTime(new Date(row.original.timestamp)),
      enableSorting: true,
      size: 180,
    },
    {
      accessorKey: 'event_type',
      header: 'Event Type',
      cell: ({ row }) => (
        <Badge status={row.original.event_type}>
          {row.original.event_type?.replace(/_/g, ' ')}
        </Badge>
      ),
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: 'actor',
      header: 'Actor',
      enableSorting: true,
      size: 150,
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }) => (
        <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {row.original.resource_type}:{row.original.resource_key}
        </code>
      ),
      enableSorting: true,
      size: 150,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.action?.replace(/_/g, ' ')}</span>
      ),
      enableSorting: true,
      size: 120,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails(row)
          }}
          className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
      enableSorting: false,
      size: 80,
    },
  ]

  const eventTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'security', label: 'Security' },
    { value: 'billing', label: 'Billing' },
    { value: 'access', label: 'Access' },
    { value: 'work_task', label: 'Work Task' },
  ]

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'status_change', label: 'Status Change' },
  ]

  const resourceOptions = [
    { value: '', label: 'All Resources' },
    { value: 'user', label: 'User' },
    { value: 'workorder', label: 'Work Order' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'fleet', label: 'Fleet Asset' },
  ]

  if (!activeBusiness) {
    return <div>Please select a business</div>
  }

  return (
    <div data-testid="audit-log-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ClockIcon className="h-8 w-8 text-blue-600" />
                Audit Log
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View system activity logs ({filteredLogs.length} of {auditLogsData.length || 0}{' '}
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
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex gap-4 items-end">
            <DatePicker
              data-testid="audit-date-filter"
              label="From Date"
              value={dateFrom.toISOString().split('T')[0]}
              onChange={handleDateFromChange}
            />
            <DatePicker
              data-testid="audit-date-to-filter"
              label="To Date"
              value={dateTo.toISOString().split('T')[0]}
              onChange={handleDateToChange}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLogs}
          isLoading={isLoading}
          onRowClick={handleViewDetails}
          enableSelection={false}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by actor, resource, or type...',
            searchValue: searchInput,
            onSearchChange: handleSearchInputChange,
            advancedFilters: [
              {
                id: 'eventType',
                label: 'Event Type',
                value: eventTypeFilter,
                onChange: (e) => setEventTypeFilter(e.target.value),
                options: eventTypeOptions,
              },
              {
                id: 'action',
                label: 'Action',
                value: actionFilter,
                onChange: (e) => setActionFilter(e.target.value),
                options: actionOptions,
              },
              {
                id: 'resource',
                label: 'Resource',
                value: resourceFilter,
                onChange: (e) => setResourceFilter(e.target.value),
                options: resourceOptions,
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
        />

        {selectedLog && (
          <AuditLogDetailsModal
            isOpen={!!selectedLog}
            onClose={handleCloseModal}
            auditLog={selectedLog}
          />
        )}
      </div>
    </div>
  )
}

export default AuditLogPage
