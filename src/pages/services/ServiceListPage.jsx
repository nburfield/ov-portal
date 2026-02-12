import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { serviceService } from '../../services/service.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { validateRequired } from '../../utils/validators'
import { PlusIcon } from '@heroicons/react/24/outline'

const ServiceListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const { data: services = [], isLoading, refetch } = useApiQuery(serviceService.getAll)

  const handleRowClick = (row) => {
    navigate(`/services/${row.original.key}`)
  }

  const handleCreateService = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveService = async (serviceData) => {
    try {
      await serviceService.create(serviceData)
      showToast('Service created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save service', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedRows.map((row) => serviceService.update(row.original.key, { status: newStatus }))
      )
      showToast(
        `${selectedRows.length} service${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update service statuses', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(services, columns, 'services')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(services, columns, 'Services Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.description}>
          {row.original.description || 'No description'}
        </div>
      ),
    },
    {
      accessorKey: 'default_price',
      header: 'Default Price',
      cell: ({ row }) => formatters.formatCurrency(row.original.default_price),
      enableSorting: true,
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => <Badge status="active">{row.original.unit}</Badge>,
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.unit === filterValue
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
  ]

  const emptyState = {
    title: 'No services found',
    description: 'Get started by creating your first service.',
    action: {
      label: 'Create Service',
      onClick: handleCreateService,
    },
  }

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={() => handleBulkChangeStatus('active')} variant="outline" size="sm">
          Set Active
        </Button>
        <Button onClick={() => handleBulkChangeStatus('inactive')} variant="outline" size="sm">
          Set Inactive
        </Button>
        <Button onClick={() => handleBulkChangeStatus('archived')} variant="outline" size="sm">
          Archive
        </Button>
      </div>
    ) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={handleCreateService} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ New Service
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={services}
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
            id: 'unit',
            value: '',
          },
          {
            id: 'status',
            value: '',
          },
        ]}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <ServiceFormModal service={null} onSave={handleSaveService} onClose={handleCloseModal} />
      )}
    </div>
  )
}

const ServiceFormModal = ({ service, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: service
      ? {
          name: service.name || '',
          description: service.description || '',
          default_price: service.default_price || '',
          unit: service.unit || 'hour',
          status: service.status || 'active',
        }
      : {
          name: '',
          description: '',
          default_price: '',
          unit: 'hour',
          status: 'active',
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
      showToast('Failed to save service', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!service

  const unitOptions = [
    { value: 'hour', label: 'Hour' },
    { value: 'job', label: 'Job' },
    { value: 'mile', label: 'Mile' },
    { value: 'sq_ft', label: 'Sq Ft' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Service' : 'Create Service'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register('name', {
              validate: (value) => validateField(value, 'Name'),
            })}
            error={errors.name?.message}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <Textarea id="description" {...register('description')} rows={3} />
        </div>

        {/* Default Price */}
        <div>
          <label
            htmlFor="default_price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Default Price <span className="text-red-500">*</span>
          </label>
          <Input
            id="default_price"
            type="number"
            step="0.01"
            {...register('default_price', {
              validate: (value) => validateField(value, 'Default price'),
            })}
            error={errors.default_price?.message}
          />
        </div>

        {/* Unit */}
        <div>
          <label
            htmlFor="unit"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Unit <span className="text-red-500">*</span>
          </label>
          <Select
            id="unit"
            {...register('unit', {
              validate: (value) => validateField(value, 'Unit'),
            })}
            error={errors.unit?.message}
            options={unitOptions}
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

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default ServiceListPage
