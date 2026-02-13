import React, { useState, useEffect } from 'react'
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
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormActions from '../../components/forms/FormActions'
import DataTable from '../../components/data-table/DataTable'
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators'
import { AuthContext } from '../../contexts/AuthContext'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  EyeIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'

const CustomerDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('details')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showAddContractModal, setShowAddContractModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'primary',
    status: 'active',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  const [formErrors, setFormErrors] = useState({})

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

  useEffect(() => {
    document.title = customer ? `OneVizn | ${customer.name}` : 'OneVizn | Customer'
  }, [customer])

  useEffect(() => {
    if (customer && !isEditing) {
      setFormData({
        name: customer.name || '',
        type: customer.type || 'primary',
        status: customer.status || 'active',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
      })
    }
  }, [customer, isEditing])

  const handleBack = () => {
    navigate('/customers')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(customer?.key || '')
      toast.success('Customer key copied to clipboard')
    } catch {
      toast.error('Failed to copy customer key')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormErrors({})
    if (customer) {
      setFormData({
        name: customer.name || '',
        type: customer.type || 'primary',
        status: customer.status || 'active',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Customer name is required.'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format.'
    }
    return errors
  }

  const handleSave = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      Object.values(errors).forEach((error) => toast.error(error))
      return
    }
    setSaving(true)
    try {
      await update(key, formData)
      toast.success('Customer updated successfully.')
      setIsEditing(false)
      await refetchCustomer()
    } catch {
      toast.error('Failed to update customer.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await remove(key)
      toast.success('Customer deleted successfully')
      navigate('/customers')
    } catch {
      toast.error('Failed to delete customer')
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">Loading customer...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            Customer not found.
          </div>
        </div>
      </div>
    )
  }

  const typeColors = {
    primary: 'bg-blue-600',
    subsidiary: 'bg-purple-600',
    division: 'bg-green-600',
  }

  const statusColors = {
    active: 'bg-green-600',
    inactive: 'bg-red-600',
    archived: 'bg-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {customer.name || 'N/A'}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${statusColors[customer.status] || 'bg-gray-600'}`}
                >
                  {customer.status || 'N/A'}
                </span>
                {customer.type && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${typeColors[customer.type] || 'bg-gray-600'}`}
                  >
                    {customer.type}
                  </span>
                )}
              </div>
              {customer.key && (
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="block text-xs text-gray-400 dark:text-gray-500 truncate cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none mt-1"
                  title="Click to copy customer key"
                >
                  {customer.key}
                </button>
              )}
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => refetchCustomer()}
                    disabled={customerLoading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 mr-2 ${customerLoading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'details' && (
            <DetailsTab
              customer={customer}
              isEditing={isEditing}
              formData={formData}
              formErrors={formErrors}
              onChange={handleChange}
            />
          )}
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
            <LocationsTab locations={locations} isLoading={locationsLoading} customerKey={key} />
          )}
          {activeTab === 'work-orders' && (
            <WorkOrdersTab workOrders={workOrders} isLoading={workOrdersLoading} />
          )}
          {activeTab === 'invoices' && (
            <InvoicesTab invoices={invoices} isLoading={invoicesLoading} />
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete Customer"
        variant="danger"
      />

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

const DetailsTab = ({ customer, isEditing, formData, formErrors, onChange }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.name
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                )}
              </>
            ) : (
              <input
                type="text"
                value={customer.name || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            {isEditing ? (
              <select
                name="type"
                value={formData.type}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="primary">Primary</option>
                <option value="subsidiary">Subsidiary</option>
                <option value="division">Division</option>
              </select>
            ) : (
              <input
                type="text"
                value={customer.type || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            {isEditing ? (
              <>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.email
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </>
            ) : (
              <input
                type="text"
                value={customer.email || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={customer.phone || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Street Address
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={customer.address || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={customer.city || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            {isEditing ? (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={customer.state || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={customer.zip || 'N/A'}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                readOnly
              />
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Created
            </label>
            <input
              type="text"
              value={formatters.formatDateTime(customer.created_at) || 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Updated
            </label>
            <input
              type="text"
              value={formatters.formatDateTime(customer.updated_at) || 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
        </div>
      </Card>
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
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h3>
        <Button onClick={onAddContact} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Contact
        </Button>
      </div>
      <DataTable columns={columns} data={contacts} isLoading={isLoading} emptyState={emptyState} />
    </Card>
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
      cell: ({ row }) => <code className="font-mono text-xs">{row.original.key}</code>,
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
      id: 'actions',
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
        </div>
      ),
      enableSorting: false,
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
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contracts</h3>
        <Button onClick={onAddContract} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Contract
        </Button>
      </div>
      <DataTable columns={columns} data={contracts} isLoading={isLoading} emptyState={emptyState} />
    </Card>
  )
}

const LocationsTab = ({ locations, isLoading, customerKey }) => {
  const navigate = useNavigate()

  const handleRowClick = (row) => {
    navigate(`/locations/${row.original.key}`)
  }

  const handleNewLocation = () => {
    navigate('/locations/new', { state: { customer_key: customerKey } })
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
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Locations</h3>
        <Button onClick={handleNewLocation} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          New Location
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={locations}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
      />
    </Card>
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
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) =>
        row.original.due_date ? formatters.formatDate(row.original.due_date) : 'N/A',
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
    },
  ]

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Work Orders</h3>
      <DataTable
        columns={columns}
        data={workOrders}
        isLoading={isLoading}
        emptyState={{
          title: 'No work orders found',
          description: 'This customer has no work orders.',
        }}
      />
    </Card>
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
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Invoices</h3>
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        emptyState={{
          title: 'No invoices found',
          description: 'This customer has no invoices.',
        }}
      />
    </Card>
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
    if (validator) return validator(value)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Contact</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <Input id="role" {...register('role')} error={errors.role?.message} />
              </div>
            </div>
          </div>
          <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
        </form>
      </div>
    </div>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Contract</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Contract Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File <span className="text-red-500">*</span>
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
          <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
        </form>
      </div>
    </div>
  )
}

export default CustomerDetailPage
