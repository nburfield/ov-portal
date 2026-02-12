import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { fleetassetService } from '../../services/fleetasset.service'
import { maintenancerecordService } from '../../services/maintenancerecord.service'
import { worktaskService } from '../../services/worktask.service'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import DatePicker from '../../components/ui/DatePicker'
import FormActions from '../../components/forms/FormActions'
import DataTable from '../../components/data-table/DataTable'
import { validateRequired } from '../../utils/validators'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

const FleetDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('details')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLogMaintenanceForm, setShowLogMaintenanceForm] = useState(false)

  const {
    data: fleetAsset,
    isLoading: assetLoading,
    refetch: refetchAsset,
  } = useApiQuery(() => fleetassetService.getByKey(key))

  const {
    data: maintenanceRecords = [],
    isLoading: maintenanceLoading,
    refetch: refetchMaintenance,
  } = useApiQuery(() => maintenancerecordService.getAll({ fleetasset_key: key }), {
    enabled: !!fleetAsset,
  })

  const { data: usageHistory = [], isLoading: usageLoading } = useApiQuery(
    () => worktaskService.getAll({ assets_used: key }),
    {
      enabled: !!fleetAsset,
    }
  )

  const handleBack = () => {
    navigate('/fleet')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(fleetAsset?.key || '')
      showToast('Fleet asset key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy fleet asset key', 'error')
    }
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await fleetassetService.remove(key)
      showToast('Fleet asset deleted successfully', 'success')
      navigate('/fleet')
    } catch {
      showToast('Failed to delete fleet asset', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleLogMaintenance = () => {
    setShowLogMaintenanceForm(true)
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'maintenance-history', label: 'Maintenance History' },
    { key: 'usage-history', label: 'Usage History' },
  ]

  if (assetLoading) {
    return <div>Loading...</div>
  }

  if (!fleetAsset) {
    return <div>Fleet asset not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Fleet
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{fleetAsset.identifier}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge>{fleetAsset.type}</Badge>
              <Badge status={fleetAsset.status}>{fleetAsset.status}</Badge>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <code className="font-mono">{fleetAsset.key}</code>
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex items-center gap-2">
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && <DetailsTab fleetAsset={fleetAsset} />}
        {activeTab === 'maintenance-history' && (
          <MaintenanceHistoryTab
            maintenanceRecords={maintenanceRecords}
            isLoading={maintenanceLoading}
            onLogMaintenance={handleLogMaintenance}
          />
        )}
        {activeTab === 'usage-history' && (
          <UsageHistoryTab usageHistory={usageHistory} isLoading={usageLoading} />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditFleetAssetModal
          fleetAsset={fleetAsset}
          onSave={async () => {
            await refetchAsset()
            setShowEditModal(false)
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Fleet Asset"
        description={`Are you sure you want to delete ${fleetAsset.identifier}? This action cannot be undone.`}
        confirmLabel="Delete Fleet Asset"
        variant="danger"
      />

      {/* Log Maintenance Modal */}
      {showLogMaintenanceForm && (
        <LogMaintenanceModal
          fleetAsset={fleetAsset}
          onSave={async () => {
            await refetchMaintenance()
            setShowLogMaintenanceForm(false)
          }}
          onClose={() => setShowLogMaintenanceForm(false)}
        />
      )}
    </div>
  )
}

const DetailsTab = ({ fleetAsset }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <Badge>{fleetAsset.type}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Identifier
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">{fleetAsset.identifier}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Badge status={fleetAsset.status}>{fleetAsset.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mileage
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatNumber(fleetAsset.mileage)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Created At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(fleetAsset.created_at)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Updated At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(fleetAsset.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const MaintenanceHistoryTab = ({ maintenanceRecords, isLoading, onLogMaintenance }) => {
  const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatters.formatDate(row.original.date),
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      enableSorting: true,
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
    },
    {
      accessorKey: 'mileage',
      header: 'Mileage',
      cell: ({ row }) => formatters.formatNumber(row.original.mileage),
      enableSorting: true,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Maintenance History</h3>
        <Button onClick={onLogMaintenance} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ Log Maintenance
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={maintenanceRecords}
        isLoading={isLoading}
        emptyState={{
          title: 'No maintenance records found',
          description: 'Log the first maintenance record for this asset.',
          action: {
            label: '+ Log Maintenance',
            onClick: onLogMaintenance,
          },
        }}
      />
    </div>
  )
}

const UsageHistoryTab = ({ usageHistory, isLoading }) => {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Task Title',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) =>
        row.original.due_date ? formatters.formatDate(row.original.due_date) : 'N/A',
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={usageHistory}
      isLoading={isLoading}
      emptyState={{
        title: 'No usage history found',
        description: 'This asset has not been used in any work tasks.',
      }}
    />
  )
}

const EditFleetAssetModal = ({ fleetAsset, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: fleetAsset.type || '',
      identifier: fleetAsset.identifier || '',
      status: fleetAsset.status || 'active',
      mileage: fleetAsset.mileage || 0,
    },
  })

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await fleetassetService.update(fleetAsset.key, data)
      showToast('Fleet asset updated successfully', 'success')
      onSave(data)
    } catch {
      showToast('Failed to update fleet asset', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const typeOptions = [
    { value: 'truck', label: 'Truck' },
    { value: 'equipment', label: 'Equipment' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'out_of_service', label: 'Out of Service' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Fleet Asset">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Type <span className="text-red-500">*</span>
          </label>
          <Select
            id="type"
            {...register('type', {
              validate: (value) => validateField(value, 'Type'),
            })}
            error={errors.type?.message}
            options={typeOptions}
          />
        </div>

        {/* Identifier */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Identifier <span className="text-red-500">*</span>
          </label>
          <Input
            id="identifier"
            {...register('identifier', {
              validate: (value) => validateField(value, 'Identifier'),
            })}
            error={errors.identifier?.message}
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
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

        {/* Mileage */}
        <div>
          <label
            htmlFor="mileage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Mileage <span className="text-red-500">*</span>
          </label>
          <Input
            id="mileage"
            type="number"
            step="1"
            {...register('mileage', {
              validate: (value) => validateField(value, 'Mileage'),
            })}
            error={errors.mileage?.message}
          />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

const LogMaintenanceModal = ({ fleetAsset, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: '',
      notes: '',
      mileage: fleetAsset.mileage || 0,
      fleetasset_key: fleetAsset.key,
    },
  })

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await maintenancerecordService.create(data)
      showToast('Maintenance record logged successfully', 'success')
      onSave()
    } catch {
      showToast('Failed to log maintenance record', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Log Maintenance">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            id="date"
            {...register('date', {
              validate: (value) => validateField(value, 'Date'),
            })}
            error={errors.date?.message}
          />
        </div>

        {/* Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Type <span className="text-red-500">*</span>
          </label>
          <Input
            id="type"
            {...register('type', {
              validate: (value) => validateField(value, 'Type'),
            })}
            error={errors.type?.message}
            placeholder="e.g., Oil Change, Tire Replacement"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notes
          </label>
          <Textarea
            id="notes"
            {...register('notes')}
            rows={3}
            placeholder="Additional details about the maintenance"
          />
        </div>

        {/* Mileage */}
        <div>
          <label
            htmlFor="mileage"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Mileage <span className="text-red-500">*</span>
          </label>
          <Input
            id="mileage"
            type="number"
            step="1"
            {...register('mileage', {
              validate: (value) => validateField(value, 'Mileage'),
            })}
            error={errors.mileage?.message}
          />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default FleetDetailPage
