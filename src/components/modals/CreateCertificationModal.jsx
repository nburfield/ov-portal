import React, { useState } from 'react'
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { useToast } from '../../hooks/useToast'
import SearchableSelect from '../ui/SearchableSelect'
import DatePicker from '../ui/DatePicker'
import { userService } from '../../services/user.service'
import { serviceService } from '../../services/service.service'

const CreateCertificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      user_key: '',
      service_key: '',
      certified_at: new Date().toISOString().split('T')[0],
      expires_at: '',
    },
  })

  const loadUserOptions = async (searchTerm) => {
    try {
      const users = await userService.getAll({ search: searchTerm })
      return users
        .filter((user) => user.roles?.includes('worker'))
        .map((user) => ({
          value: user.key,
          label: `${user.first_name} ${user.last_name}`,
        }))
    } catch {
      return []
    }
  }

  const loadServiceOptions = async (searchTerm) => {
    try {
      const services = await serviceService.getAll({ search: searchTerm })
      return services
        .filter((service) => service.status === 'active')
        .map((service) => ({
          value: service.key,
          label: service.name,
        }))
    } catch {
      return []
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSuccess(data)
      reset()
    } catch {
      showToast('Failed to save certification', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
              <ShieldCheckIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Add Certification</h2>
              <p className="text-sm text-text-tertiary">Create a new service certification</p>
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
              label="Worker"
              value={watch('user_key')}
              onChange={(value) => setValue('user_key', value)}
              loadOptions={loadUserOptions}
              error={errors.user_key?.message}
              required
              placeholder="Search for a worker..."
            />

            <SearchableSelect
              label="Service"
              value={watch('service_key')}
              onChange={(value) => setValue('service_key', value)}
              loadOptions={loadServiceOptions}
              error={errors.service_key?.message}
              required
              placeholder="Search for a service..."
            />

            <DatePicker
              label="Certified At"
              value={watch('certified_at')}
              onChange={(value) => setValue('certified_at', value)}
              error={errors.certified_at?.message}
              required
            />

            <DatePicker
              label="Expires At (optional)"
              value={watch('expires_at')}
              onChange={(value) => setValue('expires_at', value)}
              error={errors.expires_at?.message}
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
              <>
                <ShieldCheckIcon className="w-4 h-4" />
                Save Certification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateCertificationModal
