import React, { useState } from 'react'
import { XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useToast } from '../../hooks/useToast'
import { validateRequired } from '../../utils/validators'

const CustomerModal = ({ isOpen, onClose, onSuccess, customer = null }) => {
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
          type: customer.type || 'primary',
          status: customer.status || 'active',
        }
      : {
          name: '',
          type: 'primary',
          status: 'active',
        },
  })

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSuccess(data)
      reset()
    } catch {
      showToast('Failed to save customer', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const isEdit = !!customer

  const typeOptions = [
    { value: 'primary', label: 'Primary' },
    { value: 'subsidiary', label: 'Subsidiary' },
    { value: 'division', label: 'Division' },
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
              <BuildingOfficeIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEdit ? 'Edit Customer' : 'Create New Customer'}
              </h2>
              <p className="text-sm text-text-tertiary">
                {isEdit ? 'Update customer information' : 'Add a new customer to your account'}
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
            <Input
              id="name"
              label="Customer Name"
              placeholder="Enter customer name"
              required
              {...register('name', {
                validate: (value) => validateField(value, 'Name'),
              })}
              error={errors.name?.message}
            />

            <Select id="type" label="Type" {...register('type')} options={typeOptions} />

            <Select
              id="status"
              label="Status"
              required
              {...register('status', {
                validate: (value) => validateField(value, 'Status'),
              })}
              error={errors.status?.message}
              options={statusOptions}
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
              <>{isEdit ? 'Update Customer' : 'Create Customer'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerModal
