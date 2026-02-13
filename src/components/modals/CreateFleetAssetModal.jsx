import React, { useState } from 'react'
import { XMarkIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useToast } from '../../hooks/useToast'
import { validateRequired } from '../../utils/validators'

const CreateFleetAssetModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      type: '',
      identifier: '',
      status: 'active',
      mileage: 0,
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
      await onSuccess(data)
      reset()
    } catch {
      showToast('Failed to save asset', 'error')
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
              <TruckIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Create Asset</h2>
              <p className="text-sm text-text-tertiary">Add a new fleet asset to your inventory</p>
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
            <Select
              id="type"
              label="Type"
              placeholder="Select asset type"
              required
              {...register('type', {
                validate: (value) => validateField(value, 'Type'),
              })}
              error={errors.type?.message}
              options={[
                { value: 'truck', label: 'Truck' },
                { value: 'equipment', label: 'Equipment' },
              ]}
            />

            <Input
              id="identifier"
              label="Identifier"
              placeholder="VIN, plate number, or asset ID"
              required
              {...register('identifier', {
                validate: (value) => validateField(value, 'Identifier'),
              })}
              error={errors.identifier?.message}
            />

            <Select
              id="status"
              label="Status"
              required
              {...register('status', {
                validate: (value) => validateField(value, 'Status'),
              })}
              error={errors.status?.message}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'out_of_service', label: 'Out of Service' },
              ]}
            />

            <Input
              id="mileage"
              type="number"
              label="Mileage"
              placeholder="0"
              required
              {...register('mileage', {
                validate: (value) => validateField(value, 'Mileage'),
              })}
              error={errors.mileage?.message}
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
                <TruckIcon className="w-4 h-4" />
                Create Asset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateFleetAssetModal
