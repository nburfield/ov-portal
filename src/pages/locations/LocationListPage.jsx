import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import {
  getAll as getLocations,
  create as createLocation,
  update as updateLocation,
} from '../../services/location.service'
import { getAll as getCustomers } from '../../services/customer.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import SearchableSelect from '../../components/ui/SearchableSelect'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { validateRequired } from '../../utils/validators'
import { PlusIcon } from '@heroicons/react/24/outline'

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const LocationListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const { data: locations = [], isLoading, refetch } = useApiQuery(getLocations)

  const handleRowClick = (row) => {
    navigate(`/locations/${row.original.key}`)
  }

  const handleCreateLocation = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveLocation = async (locationData) => {
    try {
      await createLocation(locationData)
      showToast('Location created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save location', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedRows.map((row) => updateLocation(row.original.key, { status: newStatus }))
      )
      showToast(
        `${selectedRows.length} location${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update location statuses', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(locations, columns, 'locations')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(locations, columns, 'Locations Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => formatters.formatAddress(row.original),
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => row.original.customer_name || '',
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.customer_name === filterValue
      },
    },
    {
      accessorKey: 'city',
      header: 'City',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'state',
      header: 'State',
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.state === filterValue
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
      accessorKey: 'photos_count',
      header: 'Photos Count',
      cell: ({ row }) => row.original.photos_count || 0,
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No locations found',
    description: 'Get started by creating your first location.',
    action: {
      label: '+ New Location',
      onClick: handleCreateLocation,
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
        <h1 className="text-2xl font-bold">Locations</h1>
        <Button onClick={handleCreateLocation} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ New Location
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={locations}
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
        <LocationFormModal location={null} onSave={handleSaveLocation} onClose={handleCloseModal} />
      )}
    </div>
  )
}

const LocationFormModal = ({ location, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: location
      ? {
          customer: location.customer_key || '',
          address_1: location.address_1 || '',
          address_2: location.address_2 || '',
          city: location.city || '',
          state: location.state || '',
          zip: location.zip || '',
          latitude: location.latitude || '',
          longitude: location.longitude || '',
          access_notes: location.access_notes || '',
          status: location.status || 'active',
        }
      : {
          customer: '',
          address_1: '',
          address_2: '',
          city: '',
          state: '',
          zip: '',
          latitude: '',
          longitude: '',
          access_notes: '',
          status: 'active',
        },
  })

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const loadCustomerOptions = async (searchTerm) => {
    try {
      const customers = await getCustomers({ status: 'active', search: searchTerm })
      return customers.map((customer) => ({
        value: customer.key,
        label: customer.name,
      }))
    } catch (error) {
      console.error('Error loading customers:', error)
      return []
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save location', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!location

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Location' : 'Create Location'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer */}
        <SearchableSelect
          label="Customer"
          value={watch('customer')}
          onChange={(value) => setValue('customer', value)}
          loadOptions={loadCustomerOptions}
          placeholder="Search for a customer..."
          required
          error={errors.customer?.message}
        />

        {/* Address 1 */}
        <div>
          <label
            htmlFor="address_1"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Address 1 <span className="text-danger">*</span>
          </label>
          <Input
            id="address_1"
            {...register('address_1', {
              validate: (value) => validateField(value, 'Address 1'),
            })}
            error={errors.address_1?.message}
          />
        </div>

        {/* Address 2 */}
        <div>
          <label
            htmlFor="address_2"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Address 2
          </label>
          <Input id="address_2" {...register('address_2')} />
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            City <span className="text-danger">*</span>
          </label>
          <Input
            id="city"
            {...register('city', {
              validate: (value) => validateField(value, 'City'),
            })}
            error={errors.city?.message}
          />
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            State <span className="text-danger">*</span>
          </label>
          <Select
            id="state"
            {...register('state', {
              validate: (value) => validateField(value, 'State'),
            })}
            error={errors.state?.message}
            options={US_STATES}
          />
        </div>

        {/* Zip */}
        <div>
          <label
            htmlFor="zip"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Zip <span className="text-danger">*</span>
          </label>
          <Input
            id="zip"
            {...register('zip', {
              validate: (value) => validateField(value, 'Zip'),
            })}
            error={errors.zip?.message}
          />
        </div>

        {/* Latitude */}
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Latitude
          </label>
          <Input id="latitude" type="number" step="any" {...register('latitude')} />
        </div>

        {/* Longitude */}
        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Longitude
          </label>
          <Input id="longitude" type="number" step="any" {...register('longitude')} />
        </div>

        {/* Access Notes */}
        <div>
          <label
            htmlFor="access_notes"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Access Notes
          </label>
          <Textarea id="access_notes" {...register('access_notes')} rows={3} />
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

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default LocationListPage
