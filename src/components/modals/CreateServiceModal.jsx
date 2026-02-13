import React, { useState } from 'react'
import { XMarkIcon, PlusCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import { useToast } from '../../hooks/useToast'
import { validateRequired } from '../../utils/validators'

const CreateServiceModal = ({ isOpen, onClose, onSuccess }) => {
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
      description: '',
      default_price: '',
      unit: 'hour',
      status: 'active',
    },
  })

  const validateField = (value, fieldName) => {
    const requiredError = validateRequired(value, fieldName)
    if (requiredError) return requiredError
    return null
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSuccess(data)
      reset()
    } catch {
      showToast('Failed to create service', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
              <PlusCircleIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Create New Service</h2>
              <p className="text-sm text-text-tertiary">Add a new service offering</p>
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
            <Input
              id="name"
              label="Service Name"
              placeholder="Lawn Mowing"
              required
              {...register('name', {
                validate: (value) => validateField(value, 'Service name'),
              })}
              error={errors.name?.message}
            />

            <Textarea
              id="description"
              label="Description"
              placeholder="Describe the service..."
              rows={3}
              {...register('description')}
            />

            <div className="relative">
              <Input
                id="default_price"
                type="number"
                step="0.01"
                label="Default Price"
                placeholder="0.00"
                required
                {...register('default_price', {
                  validate: (value) => validateField(value, 'Default price'),
                })}
                error={errors.default_price?.message}
              />
              <CurrencyDollarIcon className="w-4 h-4 absolute right-3 top-[34px] text-text-muted pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                id="unit"
                label="Unit"
                required
                {...register('unit', { validate: (value) => validateField(value, 'Unit') })}
                error={errors.unit?.message}
                options={unitOptions}
              />

              <Select
                id="status"
                label="Status"
                required
                {...register('status', { validate: (value) => validateField(value, 'Status') })}
                error={errors.status?.message}
                options={statusOptions}
              />
            </div>
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
                Creating...
              </>
            ) : (
              <>
                <PlusCircleIcon className="w-4 h-4" />
                Create Service
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateServiceModal
