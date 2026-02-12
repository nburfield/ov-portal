import React, { useState, useCallback } from 'react'
import { useBusiness } from '../../hooks/useBusiness'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getAuditLogs } from '../../services/audit.service'
import DataTable from '../../components/data-table/DataTable'
import Badge from '../../components/ui/Badge'
import DatePicker from '../../components/ui/DatePicker'
import Button from '../../components/ui/Button'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { subDays, startOfDay, endOfDay } from 'date-fns'

const AuditLogPage = () => {
  const { activeBusiness } = useBusiness()
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 7))
  const [dateTo, setDateTo] = useState(new Date())

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

  const handleRowClick = useCallback(
    (row) => {
      const newExpanded = new Set(expandedRows)
      if (newExpanded.has(row.original.id)) {
        newExpanded.delete(row.original.id)
      } else {
        newExpanded.add(row.original.id)
      }
      setExpandedRows(newExpanded)
    },
    [expandedRows]
  )

  const handleExportCSV = () => {
    exportToCSV(auditLogs, columns, 'audit-logs')
  }

  const handleExportPDF = () => {
    exportToPDF(auditLogs, columns, 'Audit Logs')
  }

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
        <Badge status={row.original.event_type}>{row.original.event_type.replace('_', ' ')}</Badge>
      ),
      enableSorting: true,
      meta: {
        type: 'select',
        options: [
          { value: 'security', label: 'Security' },
          { value: 'billing', label: 'Billing' },
          { value: 'access', label: 'Access' },
          { value: 'work_task', label: 'Work Task' },
        ],
      },
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
      cell: ({ row }) => `${row.original.resource_type}:${row.original.resource_key}`,
      enableSorting: true,
      meta: {
        type: 'select',
        options: [
          // These would be populated based on available resource types
          { value: 'user', label: 'User' },
          { value: 'workorder', label: 'Work Order' },
          { value: 'invoice', label: 'Invoice' },
          { value: 'fleet', label: 'Fleet Asset' },
          // Add more as needed
        ],
      },
      size: 150,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: true,
      meta: {
        type: 'select',
        options: [
          { value: 'create', label: 'Create' },
          { value: 'update', label: 'Update' },
          { value: 'delete', label: 'Delete' },
          { value: 'status_change', label: 'Status Change' },
        ],
      },
      size: 120,
    },
    {
      id: 'expand',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleRowClick(row)
          }}
        >
          {expandedRows.has(row.original.id) ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>
      ),
      enableSorting: false,
      size: 50,
    },
  ]

  const emptyState = {
    title: 'No audit logs found',
    description: 'No audit events match your current filters.',
  }

  if (!activeBusiness) {
    return <div>Please select a business</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex gap-4 items-end">
          <DatePicker
            label="From Date"
            value={dateFrom.toISOString().split('T')[0]}
            onChange={(e) => setDateFrom(new Date(e.target.value))}
          />
          <DatePicker
            label="To Date"
            value={dateTo.toISOString().split('T')[0]}
            onChange={(e) => setDateTo(new Date(e.target.value))}
          />
          <Button onClick={refetch}>Apply Filters</Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={auditLogs}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
        enableSelection={false}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Expanded Details */}
      {auditLogs.map(
        (log) =>
          expandedRows.has(log.id) && (
            <div
              key={log.id}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2"
            >
              <h3 className="font-semibold mb-2">Event Details</h3>
              <pre className="text-sm bg-white dark:bg-gray-900 p-4 rounded border overflow-x-auto">
                {JSON.stringify(log.details || log, null, 2)}
              </pre>
            </div>
          )
      )}
    </div>
  )
}

export default AuditLogPage
