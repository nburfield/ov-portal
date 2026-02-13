import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import {
  getAll as getFleetAssets,
  create as createFleetAsset,
  update as updateFleetAsset,
} from '../../services/fleetasset.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { validateRequired } from '../../utils/validators'
import { PlusIcon } from '@heroicons/react/24/outline'

const FleetListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const { data: fleetAssets = [], isLoading, refetch } = useApiQuery(getFleetAssets)

  const handleRowClick = (row) => {
    navigate(`/fleet/${row.original.key}`)
  }

  const handleCreateAsset = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveAsset = async (assetData) => {
    try {
      await createFleetAsset(assetData)
      showToast('Asset created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save asset', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedRows.map((row) => updateFleetAsset(row.original.key, { status: newStatus }))
      )
      showToast(
        `${selectedRows.length} asset${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update asset statuses', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(fleetAssets, columns, 'fleet-assets')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(fleetAssets, columns, 'Fleet Assets Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'identifier',
      header: 'Identifier',
      cell: ({ row }) => <span className="font-mono">{row.original.identifier}</span>,
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.type === filterValue
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
      accessorKey: 'mileage',
      header: 'Mileage',
      cell: ({ row }) => formatters.formatNumber(row.original.mileage),
      enableSorting: true,
    },
    {
      accessorKey: 'maintenance_count',
      header: 'Maintenance',
      cell: ({ row }) => {
        const count = row.original.maintenance_count || 0
        const lastDate = row.original.last_maintenance_date
          ? ` (${formatters.formatDate(new Date(row.original.last_maintenance_date))})`
          : ''
        return `${count}${lastDate}`
      },
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No fleet assets found',
    description: 'Get started by creating your first asset.',
    action: {
      label: '+ New Asset',
      onClick: handleCreateAsset,
    },
  }

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={() => handleBulkChangeStatus('active')} variant="outline" size="sm">
          Set Active
        </Button>
        <Button
          onClick={() => handleBulkChangeStatus('out_of_service')}
          variant="outline"
          size="sm"
        >
          Set Out of Service
        </Button>
      </div>
    ) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fleet</h1>
        <Button onClick={handleCreateAsset} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ New Asset
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={fleetAssets}
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
          {
            id: 'type',
            value: '',
          },
        ]}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <FleetAssetFormModal asset={null} onSave={handleSaveAsset} onClose={handleCloseModal} />
      )}
    </div>
  )
}

const FleetAssetFormModal = ({ asset, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: asset
      ? {
          type: asset.type || '',
          identifier: asset.identifier || '',
          status: asset.status || 'active',
          mileage: asset.mileage || 0,
        }
      : {
          type: '',
          identifier: '',
          status: 'active',
          mileage: 0,
        },
  })

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save asset', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!asset

  const typeOptions = [
    { value: 'truck', label: 'Truck' },
    { value: 'equipment', label: 'Equipment' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'out_of_service', label: 'Out of Service' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Asset' : 'Create Asset'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Type <span className="text-danger">*</span>
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
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Identifier <span className="text-danger">*</span>
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
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Status <span className="text-danger">*</span>
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
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Mileage <span className="text-danger">*</span>
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

export default FleetListPage
