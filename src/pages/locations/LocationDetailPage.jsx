import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getByKey, update, remove } from '../../services/location.service'
import { getAll as getWorkOrders } from '../../services/workorder.service'
import { getPhotosByLocation, uploadPhoto, getPhotoUrl } from '../../services/photo.service'
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
import FileUpload from '../../components/ui/FileUpload'
import { validateRequired } from '../../utils/validators'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  EyeIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'

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

const LocationDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('details')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false)

  const {
    data: location,
    isLoading: locationLoading,
    refetch: refetchLocation,
  } = useApiQuery(() => getByKey(key))

  const { data: workOrders = [], isLoading: workOrdersLoading } = useApiQuery(
    () => getWorkOrders({ location_key: key }),
    { enabled: !!location }
  )

  const {
    data: photos = [],
    isLoading: photosLoading,
    refetch: refetchPhotos,
  } = useApiQuery(() => getPhotosByLocation(key), { enabled: !!location })

  const handleBack = () => {
    navigate('/locations')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(location?.key || '')
      showToast('Location key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy location key', 'error')
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
      showToast('Location deleted successfully', 'success')
      navigate('/locations')
    } catch {
      showToast('Failed to delete location', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'photos', label: 'Photos' },
    { key: 'work-orders', label: 'Work Orders' },
  ]

  if (locationLoading) {
    return <div>Loading...</div>
  }

  if (!location) {
    return <div>Location not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Locations
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{formatters.formatAddress(location)}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge status={location.status}>{location.status}</Badge>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <code className="font-mono">{location.key}</code>
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
        {activeTab === 'details' && <DetailsTab location={location} />}
        {activeTab === 'photos' && (
          <PhotosTab
            location={location}
            photos={photos}
            isLoading={photosLoading}
            onUploadPhoto={() => setShowUploadPhotoModal(true)}
          />
        )}
        {activeTab === 'work-orders' && (
          <WorkOrdersTab workOrders={workOrders} isLoading={workOrdersLoading} />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditLocationModal
          location={location}
          onSave={async () => {
            await refetchLocation()
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
        title="Delete Location"
        description={`Are you sure you want to delete ${formatters.formatAddress(location)}? This action cannot be undone.`}
        confirmLabel="Delete Location"
        variant="danger"
      />

      {/* Upload Photo Modal */}
      {showUploadPhotoModal && (
        <UploadPhotoModal
          locationKey={key}
          onSave={async () => {
            await refetchPhotos()
            setShowUploadPhotoModal(false)
          }}
          onClose={() => setShowUploadPhotoModal(false)}
        />
      )}
    </div>
  )
}

const DetailsTab = ({ location }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address 1
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.address_1}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address 2
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.address_2 || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.city}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.state}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Zip
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.zip}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Badge status={location.status}>{location.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Latitude
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.latitude || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Longitude
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.longitude || 'N/A'}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Access Notes
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{location.access_notes || 'N/A'}</p>
        </div>
      </div>
      {location.latitude && location.longitude && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Map Preview
          </label>
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Map preview placeholder</span>
          </div>
        </div>
      )}
    </div>
  )
}

const PhotosTab = ({ location, onUploadPhoto, photos = [], isLoading = false }) => {
  const { showToast } = useToast()

  const handleViewPhoto = async (photo) => {
    try {
      const url = await getPhotoUrl(location.key, photo.key)
      window.open(url, '_blank')
    } catch {
      showToast('Failed to get photo URL', 'error')
    }
  }

  if (isLoading) {
    return <div>Loading photos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Photos</h3>
        <Button onClick={onUploadPhoto} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Upload Photo
        </Button>
      </div>
      {photos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.key} className="border rounded-lg p-4">
              <img
                src={photo.thumbnail_url || '/placeholder-image.png'}
                alt={photo.filename}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={() => handleViewPhoto(photo)}
              />
              <p className="mt-2 text-sm font-medium">{photo.filename}</p>
              <p className="text-sm text-gray-500">
                {photo.taken_at ? formatters.formatDate(photo.taken_at) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{photo.note || 'No note'}</p>
            </div>
          ))}
        </div>
      )}
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
        description: 'This location has no work orders.',
      }}
    />
  )
}

const EditLocationModal = ({ location, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address_1: location.address_1 || '',
      address_2: location.address_2 || '',
      city: location.city || '',
      state: location.state || '',
      zip: location.zip || '',
      latitude: location.latitude || '',
      longitude: location.longitude || '',
      access_notes: location.access_notes || '',
      status: location.status || 'active',
    },
  })

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await update(location.key, data)
      showToast('Location updated successfully', 'success')
      onSave(data)
    } catch {
      showToast('Failed to update location', 'error')
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
    <Modal isOpen={true} onClose={onClose} title="Edit Location">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Address 1 */}
        <div>
          <label
            htmlFor="address_1"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Address 1 <span className="text-red-500">*</span>
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Address 2
          </label>
          <Input id="address_2" {...register('address_2')} />
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            City <span className="text-red-500">*</span>
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            State <span className="text-red-500">*</span>
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Zip <span className="text-red-500">*</span>
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Latitude
          </label>
          <Input id="latitude" type="number" step="any" {...register('latitude')} />
        </div>

        {/* Longitude */}
        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Longitude
          </label>
          <Input id="longitude" type="number" step="any" {...register('longitude')} />
        </div>

        {/* Access Notes */}
        <div>
          <label
            htmlFor="access_notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Access Notes
          </label>
          <Textarea id="access_notes" {...register('access_notes')} rows={3} />
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

const UploadPhotoModal = ({ locationKey, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      taken_at: '',
      note: '',
    },
  })

  const onSubmit = async (data) => {
    if (!file) {
      showToast('Please select a file', 'error')
      return
    }

    setIsLoading(true)
    try {
      await uploadPhoto(locationKey, data, file)
      showToast('Photo uploaded successfully', 'success')
      reset()
      setFile(null)
      onSave()
    } catch {
      showToast('Failed to upload photo', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Photo">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload */}
        <FileUpload
          label="Photo"
          accept="image/*"
          maxSize={10 * 1024 * 1024} // 10MB
          onFile={setFile}
          className="w-full"
        />

        {/* Taken At */}
        <div>
          <label
            htmlFor="taken_at"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Taken At
          </label>
          <Input id="taken_at" type="datetime-local" {...register('taken_at')} />
        </div>

        {/* Note */}
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Note
          </label>
          <Textarea id="note" {...register('note')} rows={3} />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default LocationDetailPage
