import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import {
  getByKey,
  update,
  remove,
  getContacts,
  createContact,
  getContracts,
  createContract,
  uploadContract,
  getContractUrl,
} from '../../services/customer.service'
import { getAll as getLocations } from '../../services/location.service'
import { getAll as getWorkOrders } from '../../services/workorder.service'
import { getAll as getInvoices } from '../../services/invoice.service'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { FormActions } from '../../components/forms/FormActions'
import { DataTable } from '../../components/data-table/DataTable'
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  EyeIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'

const CustomerDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('details')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showAddContractModal, setShowAddContractModal] = useState(false)

  const {
    data: customer,
    isLoading: customerLoading,
    refetch: refetchCustomer,
  } = useApiQuery(() => getByKey(key))

  const {
    data: contacts = [],
    isLoading: contactsLoading,
    refetch: refetchContacts,
  } = useApiQuery(() => getContacts(key), { enabled: !!customer })

  const {
    data: contracts = [],
    isLoading: contractsLoading,
    refetch: refetchContracts,
  } = useApiQuery(() => getContracts(key), { enabled: !!customer })

  const { data: locations = [], isLoading: locationsLoading } = useApiQuery(
    () => getLocations({ customer_key: key }),
    { enabled: !!customer }
  )

  const { data: workOrders = [], isLoading: workOrdersLoading } = useApiQuery(
    () => getWorkOrders({ customer_key: key }),
    { enabled: !!customer }
  )

  const { data: invoices = [], isLoading: invoicesLoading } = useApiQuery(
    () => getInvoices({ customer_key: key }),
    { enabled: !!customer }
  )

  const handleBack = () => {
    navigate('/customers')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(customer?.key || '')
      showToast('Customer key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy customer key', 'error')
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
      await remove(key)
      showToast('Customer deleted successfully', 'success')
      navigate('/customers')
    } catch {
      showToast('Failed to delete customer', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'contracts', label: 'Contracts' },
    { key: 'locations', label: 'Locations' },
    { key: 'work-orders', label: 'Work Orders' },
    { key: 'invoices', label: 'Invoices' },
  ]

  if (customerLoading) {
    return <div>Loading...</div>
  }

  if (!customer) {
    return <div>Customer not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge status={customer.status}>{customer.status}</Badge>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <code className="font-mono">{customer.key}</code>
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
        {activeTab === 'details' && <DetailsTab customer={customer} />}
        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            isLoading={contactsLoading}
            onAddContact={() => setShowAddContactModal(true)}
          />
        )}
        {activeTab === 'contracts' && (
          <ContractsTab
            contracts={contracts}
            isLoading={contractsLoading}
            customerKey={key}
            onAddContract={() => setShowAddContractModal(true)}
            refetchContracts={refetchContracts}
          />
        )}
        {activeTab === 'locations' && (
          <LocationsTab locations={locations} isLoading={locationsLoading} />
        )}
        {activeTab === 'work-orders' && (
          <WorkOrdersTab workOrders={workOrders} isLoading={workOrdersLoading} />
        )}
        {activeTab === 'invoices' && (
          <InvoicesTab invoices={invoices} isLoading={invoicesLoading} />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditCustomerModal
          customer={customer}
          onSave={async () => {
            await refetchCustomer()
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
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete Customer"
        variant="danger"
      />

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <AddContactModal
          customerKey={key}
          onSave={async () => {
            await refetchContacts()
            setShowAddContactModal(false)
          }}
          onClose={() => setShowAddContactModal(false)}
        />
      )}

      {/* Add Contract Modal */}
      {showAddContractModal && (
        <AddContractModal
          customerKey={key}
          onSave={async () => {
            await refetchContracts()
            setShowAddContractModal(false)
          }}
          onClose={() => setShowAddContractModal(false)}
        />
      )}
    </div>
  )
}

const DetailsTab = ({ customer }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{customer.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Badge status={customer.status}>{customer.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">{customer.key}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Created At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(customer.created_at)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Updated At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(customer.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const ContactsTab = ({ contacts, isLoading, onAddContact }) => {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (row.original.phone ? formatters.formatPhone(row.original.phone) : 'N/A'),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
  ]

  const emptyState = {
    title: 'No contacts found',
    description: 'Get started by adding the first contact.',
    action: {
      label: '+ Add Contact',
      onClick: onAddContact,
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Contacts</h3>
        <Button onClick={onAddContact} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ Add Contact
        </Button>
      </div>
      <DataTable columns={columns} data={contacts} isLoading={isLoading} emptyState={emptyState} />
    </div>
  )
}

const ContractsTab = ({ contracts, isLoading, customerKey, onAddContract }) => {
  const { showToast } = useToast()

  const handleViewContract = async (contract) => {
    try {
      const url = await getContractUrl(customerKey, contract.key)
      window.open(url, '_blank')
    } catch {
      showToast('Failed to get contract URL', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'key',
      header: 'Contract Key',
      cell: ({ row }) => <code className="font-mono">{row.original.key}</code>,
    },
    {
      accessorKey: 'file_name',
      header: 'File Name',
    },
    {
      accessorKey: 'effective_date',
      header: 'Effective Date',
      cell: ({ row }) => formatters.formatDate(row.original.effective_date),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewContract(row.original)}
            className="flex items-center gap-1"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              /* TODO: Upload */
            }}
            className="flex items-center gap-1"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            Upload
          </Button>
        </div>
      ),
    },
  ]

  const emptyState = {
    title: 'No contracts found',
    description: 'Get started by adding the first contract.',
    action: {
      label: '+ Add Contract',
      onClick: onAddContract,
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Contracts</h3>
        <Button onClick={onAddContract} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ Add Contract
        </Button>
      </div>
      <DataTable columns={columns} data={contracts} isLoading={isLoading} emptyState={emptyState} />
    </div>
  )
}

const LocationsTab = ({ locations, isLoading }) => {
  const navigate = useNavigate()

  const handleRowClick = (row) => {
    navigate(`/locations/${row.original.key}`)
  }

  const handleNewLocation = () => {
    // TODO: Navigate to create location with customer pre-selected
  }

  const columns = [
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => {
        const { street, city, state, zip } = row.original
        return `${street}, ${city}, ${state} ${zip}`
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'photos_count',
      header: 'Photos',
      cell: ({ row }) => row.original.photos_count || 0,
    },
  ]

  const emptyState = {
    title: 'No locations found',
    description: 'Create a new location for this customer.',
    action: {
      label: '+ New Location',
      onClick: handleNewLocation,
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Locations</h3>
        <Button onClick={handleNewLocation} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ New Location
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={locations}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
      />
    </div>
  )
}

const WorkOrdersTab = ({ workOrders, isLoading }) => {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <Badge status={row.original.priority}>{row.original.priority}</Badge>,
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
      data={workOrders}
      isLoading={isLoading}
      emptyState={{
        title: 'No work orders found',
        description: 'This customer has no work orders.',
      }}
    />
  )
}

const InvoicesTab = ({ invoices, isLoading }) => {
  const columns = [
    {
      accessorKey: 'number',
      header: 'Invoice Number',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatters.formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => formatters.formatDate(row.original.due_date),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      emptyState={{
        title: 'No invoices found',
        description: 'This customer has no invoices.',
      }}
    />
  )
}

const EditCustomerModal = ({ customer, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: customer.name || '',
      status: customer.status || 'active',
    },
  })

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await update(customer.key, data)
      showToast('Customer updated successfully', 'success')
      onSave(data)
    } catch {
      showToast('Failed to update customer', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Customer">
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

const AddContactModal = ({ customerKey, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      role: '',
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
      await createContact(customerKey, data)
      showToast('Contact added successfully', 'success')
      reset()
      onSave()
    } catch {
      showToast('Failed to add contact', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Contact">
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

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            {...register('phone', {
              validate: (value) => (value ? validatePhone(value) : null),
            })}
            error={errors.phone?.message}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              validate: (value) => (value ? validateEmail(value) : null),
            })}
            error={errors.email?.message}
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role
          </label>
          <Input id="role" {...register('role')} error={errors.role?.message} />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

const AddContractModal = ({ customerKey, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      file_name: '',
      effective_date: '',
    },
  })

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const onSubmit = async (data) => {
    if (!file) {
      showToast('Please select a file', 'error')
      return
    }

    setIsLoading(true)
    try {
      const contract = await createContract(customerKey, {
        file_name: data.file_name,
        effective_date: data.effective_date,
      })
      await uploadContract(customerKey, contract.key, file)
      showToast('Contract added successfully', 'success')
      reset()
      setFile(null)
      onSave()
    } catch {
      showToast('Failed to add contract', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Contract">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Name */}
        <div>
          <label
            htmlFor="file_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            File Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="file_name"
            {...register('file_name', {
              validate: (value) => validateField(value, 'File name'),
            })}
            error={errors.file_name?.message}
          />
        </div>

        {/* Effective Date */}
        <div>
          <label
            htmlFor="effective_date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Effective Date <span className="text-red-500">*</span>
          </label>
          <Input
            id="effective_date"
            type="date"
            {...register('effective_date', {
              validate: (value) => validateField(value, 'Effective date'),
            })}
            error={errors.effective_date?.message}
          />
        </div>

        {/* File Upload */}
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            File <span className="text-red-500">*</span>
          </label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default CustomerDetailPage
