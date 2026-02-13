import React, { useState } from 'react'
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { getAll as getCustomers } from '../../services/customer.service'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import SearchableSelect from '../ui/SearchableSelect'
import { useToast } from '../../hooks/useToast'
import { validateRequired } from '../../utils/validators'

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

const LocationModal = ({ isOpen, onClose, onSuccess, location = null }) => {
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
    return validateRequired(value, fieldName)
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
      await onSuccess(data)
      reset()
    } catch {
      showToast('Failed to save location', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const isEdit = !!location

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) onClose()
        }}
      />
      <div className="relative bg-bg-card rounded-xl shadow-xl border border-border/50 w-full max-w-xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <MapPinIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEdit ? 'Edit Location' : 'Create New Location'}
              </h2>
              <p className="text-sm text-text-tertiary">
                {isEdit ? 'Update location information' : 'Add a new location to your account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <SearchableSelect
              label="Customer"
              value={watch('customer')}
              onChange={(value) => setValue('customer', value)}
              loadOptions={loadCustomerOptions}
              placeholder="Search for a customer..."
              required
              error={errors.customer?.message}
            />

            <Input
              id="address_1"
              label="Address 1"
              placeholder="Enter street address"
              required
              {...register('address_1', {
                validate: (value) => validateField(value, 'Address 1'),
              })}
              error={errors.address_1?.message}
            />

            <Input
              id="address_2"
              label="Address 2"
              placeholder="Apt, suite, unit, etc. (optional)"
              {...register('address_2')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="city"
                label="City"
                placeholder="Enter city"
                required
                {...register('city', {
                  validate: (value) => validateField(value, 'City'),
                })}
                error={errors.city?.message}
              />

              <Select
                id="state"
                label="State"
                required
                {...register('state', {
                  validate: (value) => validateField(value, 'State'),
                })}
                error={errors.state?.message}
                options={US_STATES}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="zip"
                label="ZIP Code"
                placeholder="Enter ZIP code"
                required
                {...register('zip', {
                  validate: (value) => validateField(value, 'ZIP'),
                })}
                error={errors.zip?.message}
              />

              <Input
                id="status"
                label="Status"
                required
                {...register('status', {
                  validate: (value) => validateField(value, 'Status'),
                })}
                error={errors.status?.message}
                as="select"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="latitude"
                label="Latitude"
                type="number"
                step="any"
                placeholder="e.g. 40.7128"
                {...register('latitude')}
              />

              <Input
                id="longitude"
                label="Longitude"
                type="number"
                step="any"
                placeholder="e.g. -74.0060"
                {...register('longitude')}
              />
            </div>

            <Textarea
              id="access_notes"
              label="Access Notes"
              placeholder="Notes about accessing this location..."
              rows={3}
              {...register('access_notes')}
            />
          </form>
        </div>

        <div className="px-6 py-4 border-t border-border/50 bg-bg-tertiary/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
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
                Saving...
              </>
            ) : (
              <>{isEdit ? 'Update Location' : 'Create Location'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationModal
