import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getAll, create, update } from '../../services/customer.service'
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

const CustomerListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const { data: customers = [], isLoading, refetch } = useApiQuery(getAll)

  const handleRowClick = (row) => {
    navigate(`/customers/${row.original.key}`)
  }

  const handleCreateCustomer = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveCustomer = async (customerData) => {
    try {
      await create(customerData)
      showToast('Customer created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save customer', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(selectedRows.map((row) => update(row.original.key, { status: newStatus })))
      showToast(
        `${selectedRows.length} customer${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update customer statuses', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(customers, columns, 'customers')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(customers, columns, 'Customers Report')
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
      accessorKey: 'contacts_count',
      header: 'Contacts Count',
      cell: ({ row }) => row.original.contacts_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'contracts_count',
      header: 'Contracts Count',
      cell: ({ row }) => row.original.contracts_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'locations_count',
      header: 'Locations Count',
      cell: ({ row }) => row.original.locations_count || 0,
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
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No customers found',
    description: 'Get started by creating your first customer.',
    action: {
      label: '+ New Customer',
      onClick: handleCreateCustomer,
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
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={handleCreateCustomer} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ New Customer
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={customers}
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
        ]}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <CustomerFormModal customer={null} onSave={handleSaveCustomer} onClose={handleCloseModal} />
      )}
    </div>
  )
}

const CustomerFormModal = ({ customer, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: customer
      ? {
          name: customer.name || '',
          status: customer.status || 'active',
        }
      : {
          name: '',
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
      showToast('Failed to save customer', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!customer

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Create Customer'}>
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

export default CustomerListPage
