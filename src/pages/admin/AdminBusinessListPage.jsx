import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { businessService } from '../../services/business.service'
import { useBusiness } from '../../hooks/useBusiness'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { validateRequired } from '../../utils/validators'
import { PlusIcon, UserGroupIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'

const AdminBusinessListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { switchBusiness } = useBusiness()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: businesses = [], isLoading, refetch } = useApiQuery(businessService.getAll)

  const handleRowClick = (row) => {
    navigate(`/admin/businesses/${row.original.key}`)
  }

  const handleCreateBusiness = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveBusiness = async (businessData) => {
    try {
      await businessService.create(businessData)
      showToast('Business created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to create business', 'error')
    }
  }

  const handleStatusChange = async (businessKey, newStatus) => {
    try {
      await businessService.update(businessKey, { status: newStatus })
      showToast(`Business ${newStatus} successfully`, 'success')
      refetch()
    } catch {
      showToast('Failed to update business status', 'error')
    }
  }

  const handleImpersonate = async (business) => {
    try {
      switchBusiness(business.key)
      showToast(`Switched to ${business.name}`, 'success')
      navigate('/dashboard')
    } catch {
      showToast('Failed to impersonate business', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => row.original.name,
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'users_count',
      header: 'Users Count',
      cell: ({ row }) => row.original.users_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'customers_count',
      header: 'Customers Count',
      cell: ({ row }) => row.original.customers_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'work_orders_count',
      header: 'Work Orders',
      cell: ({ row }) => row.original.work_orders_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatDate(row.original.created_at),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Select
            value={row.original.status}
            onChange={(value) => handleStatusChange(row.original.key, value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
            className="w-32"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleImpersonate(row.original)
            }}
            className="flex items-center gap-1"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Impersonate
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ]

  const emptyState = {
    title: 'No businesses found',
    description: 'Get started by creating your first business.',
    action: {
      label: 'Create Business',
      onClick: handleCreateBusiness,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin - Businesses</h1>
        <Button onClick={handleCreateBusiness} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Business
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={businesses}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
      />

      {/* Create Business Modal */}
      {showCreateModal && (
        <BusinessFormModal business={null} onSave={handleSaveBusiness} onClose={handleCloseModal} />
      )}
    </div>
  )
}

const BusinessFormModal = ({ business, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: business
      ? {
          name: business.name || '',
          type: business.type || 'primary',
          status: business.status || 'active',
        }
      : {
          name: '',
          type: 'primary',
          status: 'active',
        },
  })

  const validateField = (value, fieldName, validator) => {
    const requiredError = validateRequired(value, fieldName)
    if (requiredError) return requiredError

    if (validator) {
      return validator(value)
    }
    return null
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save business', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!business

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Business' : 'Create Business'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Name <span className="text-danger">*</span>
          </label>
          <Input
            id="name"
            {...register('name', {
              validate: (value) => validateField(value, 'Name'),
            })}
            error={errors.name?.message}
          />
        </div>

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
            options={[
              { value: 'primary', label: 'Primary' },
              { value: 'subcontractor', label: 'Subcontractor' },
              { value: 'both', label: 'Both' },
            ]}
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
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default AdminBusinessListPage
