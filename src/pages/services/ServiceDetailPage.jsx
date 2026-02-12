import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { serviceService } from '../../services/service.service'
import { userserviceService } from '../../services/userservice.service'
import { workorderService } from '../../services/workorder.service'
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
import FormActions from '../../components/forms/FormActions'
import DataTable from '../../components/data-table/DataTable'
import { validateRequired } from '../../utils/validators'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'

const ServiceDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('details')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    data: service,
    isLoading: serviceLoading,
    refetch: refetchService,
  } = useApiQuery(() => serviceService.getByKey(key))

  const { data: certifiedUsers = [], isLoading: certsLoading } = useApiQuery(
    () => userserviceService.getAll({ service_key: key }),
    { enabled: !!service }
  )

  const { data: workOrders = [], isLoading: workOrdersLoading } = useApiQuery(
    () => workorderService.getAll({ service_key: key }),
    { enabled: !!service }
  )

  const handleBack = () => {
    navigate('/services')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(service?.key || '')
      showToast('Service key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy service key', 'error')
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
      await serviceService.remove(key)
      showToast('Service deleted successfully', 'success')
      navigate('/services')
    } catch {
      showToast('Failed to delete service', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'certified-users', label: 'Certified Users' },
    { key: 'work-orders', label: 'Work Orders' },
  ]

  if (serviceLoading) {
    return <div>Loading...</div>
  }

  if (!service) {
    return <div>Service not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Services
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{service.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge status={service.status}>{service.status}</Badge>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <code className="font-mono">{service.key}</code>
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
        {activeTab === 'details' && <DetailsTab service={service} />}
        {activeTab === 'certified-users' && (
          <CertifiedUsersTab certifiedUsers={certifiedUsers} isLoading={certsLoading} />
        )}
        {activeTab === 'work-orders' && (
          <WorkOrdersTab workOrders={workOrders} isLoading={workOrdersLoading} />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditServiceModal
          service={service}
          onSave={async () => {
            await refetchService()
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
        title="Delete Service"
        description={`Are you sure you want to delete ${service.name}? This action cannot be undone.`}
        confirmLabel="Delete Service"
        variant="danger"
      />
    </div>
  )
}

const DetailsTab = ({ service }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{service.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {service.description || 'No description'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Price
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatCurrency(service.default_price)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit
          </label>
          <Badge status="active">{service.unit}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Badge status={service.status}>{service.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">{service.key}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Created At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(service.created_at)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Updated At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(service.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const CertifiedUsersTab = ({ certifiedUsers, isLoading }) => {
  const columns = [
    {
      accessorKey: 'user_name',
      header: 'User Name',
    },
    {
      accessorKey: 'certified_date',
      header: 'Certified Date',
      cell: ({ row }) => formatters.formatDate(row.original.certified_date),
    },
    {
      accessorKey: 'expiration_date',
      header: 'Expiration Date',
      cell: ({ row }) => formatters.formatDate(row.original.expiration_date),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={certifiedUsers}
      isLoading={isLoading}
      emptyState={{
        title: 'No certified users found',
        description: 'This service has no certified users.',
      }}
    />
  )
}

const WorkOrdersTab = ({ workOrders, isLoading }) => {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'next_scheduled_date',
      header: 'Next Date',
      cell: ({ row }) =>
        row.original.next_scheduled_date
          ? formatters.formatDate(row.original.next_scheduled_date)
          : 'N/A',
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={workOrders}
      isLoading={isLoading}
      emptyState={{
        title: 'No work orders found',
        description: 'This service has no associated work orders.',
      }}
    />
  )
}

const EditServiceModal = ({ service, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: service.name || '',
      description: service.description || '',
      default_price: service.default_price || '',
      unit: service.unit || 'hour',
      status: service.status || 'active',
    },
  })

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await serviceService.update(service.key, data)
      showToast('Service updated successfully', 'success')
      onSave(data)
    } catch {
      showToast('Failed to update service', 'error')
    } finally {
      setIsLoading(false)
    }
  }

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
    <Modal isOpen={true} onClose={onClose} title="Edit Service">
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

export default ServiceDetailPage
