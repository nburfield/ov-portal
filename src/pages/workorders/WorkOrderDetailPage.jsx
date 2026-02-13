import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getByKey, remove } from '../../services/workorder.service'
import { getAll } from '../../services/worktask.service'
import { getContacts } from '../../services/customer.service'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { rruleToHumanReadable, getOccurrences } from '../../utils/rrule'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DataTable from '../../components/data-table/DataTable'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'

const WorkOrderDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('details')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: workOrder, isLoading: workOrderLoading } = useApiQuery(() => getByKey(key))

  const { data: workTasks = [], isLoading: workTasksLoading } = useApiQuery(
    () => getAll({ workorder_key: key }),
    { enabled: !!workOrder }
  )

  const { data: customerContacts = [], isLoading: contactsLoading } = useApiQuery(
    () => (workOrder?.customer_key ? getContacts(workOrder.customer_key) : Promise.resolve([])),
    { enabled: !!workOrder }
  )

  const handleBack = () => {
    navigate('/workorders')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(workOrder?.key || '')
      showToast('Work order key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy work order key', 'error')
    }
  }

  const handleEdit = () => {
    navigate(`/workorders/${key}/edit`)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await remove(key)
      showToast('Work order deleted successfully', 'success')
      navigate('/workorders')
    } catch {
      showToast('Failed to delete work order', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'work-tasks', label: 'Work Tasks' },
    { key: 'contact', label: 'Contact' },
  ]

  if (workOrderLoading) {
    return <div>Loading...</div>
  }

  if (!workOrder) {
    return <div>Work order not found</div>
  }

  return (
    <div data-testid="wo-detail-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            data-testid="back-button"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Work Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Work Order {workOrder.key}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge status={workOrder.status}>{workOrder.status}</Badge>
              <button
                onClick={handleCopyKey}
                data-testid="wo-copy-key"
                className="flex items-center space-x-1 text-sm text-text-tertiary hover:text-text-primary"
              >
                <code data-testid="wo-detail-key" className="font-mono">
                  {workOrder.key}
                </code>
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            data-testid="wo-edit-button"
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            data-testid="wo-delete-button"
            className="flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && <DetailsTab workOrder={workOrder} />}
        {activeTab === 'schedule' && <ScheduleTab workOrder={workOrder} workTasks={workTasks} />}
        {activeTab === 'work-tasks' && (
          <WorkTasksTab workTasks={workTasks} isLoading={workTasksLoading} />
        )}
        {activeTab === 'contact' && (
          <ContactTab
            customerContacts={customerContacts}
            customerContactKey={workOrder.customer_contact_key}
            isLoading={contactsLoading}
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Work Order"
        description={`Are you sure you want to delete work order ${workOrder.key}? This action cannot be undone.`}
        confirmLabel="Delete Work Order"
        variant="danger"
      />
    </div>
  )
}

const DetailsTab = ({ workOrder }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Key</label>
          <p data-testid="wo-detail-key" className="text-sm text-text-primary font-mono">
            {workOrder.key}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
          <Badge data-testid="wo-detail-status" status={workOrder.status}>
            {workOrder.status}
          </Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Customer</label>
          <p data-testid="wo-detail-customer" className="text-sm text-text-primary">
            {workOrder.customer_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
          <p className="text-sm text-text-primary">{workOrder.location_address}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Service</label>
          <p data-testid="wo-detail-service" className="text-sm text-text-primary">
            {workOrder.service_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Price</label>
          <p data-testid="wo-detail-price" className="text-sm text-text-primary">
            {formatters.formatCurrency(workOrder.price || 0)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Owning Business
          </label>
          <p className="text-sm text-text-primary">{workOrder.owning_business_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Assigned Business
          </label>
          <p className="text-sm text-text-primary">{workOrder.assigned_business_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Start Date</label>
          <p data-testid="wo-detail-schedule" className="text-sm text-text-primary">
            {formatters.formatDate(new Date(workOrder.start_date))}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">End Date</label>
          <p className="text-sm text-text-primary">
            {workOrder.end_date ? formatters.formatDate(new Date(workOrder.end_date)) : 'N/A'}
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Recurring Schedule
          </label>
          <p className="text-sm text-text-primary">
            {workOrder.recurring_schedule
              ? rruleToHumanReadable(workOrder.recurring_schedule)
              : 'One-time'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Created At</label>
          <p className="text-sm text-text-primary">
            {formatters.formatDateTime(workOrder.created_at)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Updated At</label>
          <p className="text-sm text-text-primary">
            {formatters.formatDateTime(workOrder.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const ScheduleTab = ({ workOrder, workTasks }) => {
  if (!workOrder.recurring_schedule) {
    return (
      <div className="text-center py-8">
        <p className="text-text-tertiary">
          This is a one-time work order with no recurring schedule.
        </p>
      </div>
    )
  }

  // Get next 30 occurrences
  const startDate = new Date(workOrder.start_date)
  const occurrences = getOccurrences(workOrder.recurring_schedule, startDate, 30)

  // Create a map of work tasks by date
  const workTasksByDate = workTasks.reduce((acc, task) => {
    const dateKey = new Date(task.performed_at).toDateString()
    acc[dateKey] = task
    return acc
  }, {})

  // Group occurrences by month
  const months = occurrences.reduce((acc, date) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(date)
    return acc
  }, {})

  return (
    <div data-testid="wo-detail-page" className="space-y-6">
      {Object.entries(months).map(([monthKey, dates]) => {
        const [year, month] = monthKey.split('-').map(Number)
        const monthName = new Date(year, month).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })

        return (
          <div key={monthKey} className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">{monthName}</h3>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-text-tertiary py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {(() => {
                const firstDay = new Date(year, month, 1)
                const lastDay = new Date(year, month + 1, 0)
                const startDate = new Date(firstDay)
                startDate.setDate(startDate.getDate() - firstDay.getDay())

                const calendarDays = []
                const currentDate = new Date(startDate)

                while (currentDate <= lastDay || calendarDays.length % 7 !== 0) {
                  const isCurrentMonth = currentDate.getMonth() === month
                  const isScheduled = dates.some(
                    (d) => d.toDateString() === currentDate.toDateString()
                  )
                  const task = workTasksByDate[currentDate.toDateString()]

                  calendarDays.push(
                    <div
                      key={currentDate.toISOString()}
                      className={`min-h-[60px] p-2 border rounded ${
                        isCurrentMonth ? 'bg-bg-card' : 'bg-bg-secondary'
                      } ${isScheduled ? 'border-accent bg-accent/10' : ''}`}
                    >
                      <div className="text-sm font-medium">{currentDate.getDate()}</div>
                      {isScheduled && (
                        <div className="mt-1">
                          {task ? (
                            <Badge status="success" className="text-xs">
                              Task #{task.key.slice(-4)}
                            </Badge>
                          ) : (
                            <Badge status="default" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )

                  currentDate.setDate(currentDate.getDate() + 1)
                }

                return calendarDays
              })()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const WorkTasksTab = ({ workTasks, isLoading }) => {
  const navigate = useNavigate()

  const handleRowClick = (row) => {
    navigate(`/worktasks/${row.original.key}`)
  }

  const columns = [
    {
      accessorKey: 'performed_at',
      header: 'Performed At',
      cell: ({ row }) => formatters.formatDateTime(new Date(row.original.performed_at)),
    },
    {
      accessorKey: 'worker_name',
      header: 'Worker',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'photos_count',
      header: 'Photos Count',
      cell: ({ row }) => row.original.photos_count || 0,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 data-testid="wo-worktasks-list" className="text-lg font-medium">
          Work Tasks
        </h3>
      </div>
      <DataTable
        columns={columns}
        data={workTasks}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        emptyState={{
          title: 'No work tasks found',
          description: 'No work tasks have been performed for this work order yet.',
        }}
      />
    </div>
  )
}

const ContactTab = ({ customerContacts, customerContactKey, isLoading }) => {
  const contact = customerContacts.find((c) => c.key === customerContactKey)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!contact) {
    return (
      <div className="text-center py-8">
        <p className="text-text-tertiary">No contact assigned to this work order.</p>
      </div>
    )
  }

  return (
    <div data-testid="wo-detail-page" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
          <p className="text-sm text-text-primary">
            {contact.first_name} {contact.last_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
          <p className="text-sm text-text-primary">
            {contact.phone ? formatters.formatPhone(contact.phone) : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <p className="text-sm text-text-primary">{contact.email || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
          <p className="text-sm text-text-primary">{contact.role || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

export default WorkOrderDetailPage
