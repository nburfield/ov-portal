import React, { useState } from 'react'
import { XMarkIcon, DocumentPlusIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Select from '../ui/Select'
import DatePicker from '../ui/DatePicker'
import { useToast } from '../../hooks/useToast'
import { validateRequired } from '../../utils/validators'

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, customers = [] }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      customer_key: '',
      period_start: '',
      period_end: '',
      tax: 0.0,
      status: 'draft',
    },
  })

  const periodStart = watch('period_start')

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const validatePeriodEnd = (value) => {
    if (!periodStart || !value) return
    if (new Date(value) <= new Date(periodStart)) {
      return 'Period end must be after period start'
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSuccess(data)
      reset()
    } catch {
      showToast('Failed to create invoice', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const customerOptions = customers.map((customer) => ({
    value: customer.key,
    label: customer.name,
  }))

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
              <DocumentPlusIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Create Invoice</h2>
              <p className="text-sm text-text-tertiary">Create a new invoice for a customer</p>
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
              id="customer_key"
              label="Customer"
              placeholder="Select a customer"
              required
              {...register('customer_key', {
                validate: (value) => validateField(value, 'Customer'),
              })}
              error={errors.customer_key?.message}
              options={customerOptions}
            />

            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Period Start"
                {...register('period_start', {
                  validate: (value) => validateField(value, 'Period Start'),
                })}
                error={errors.period_start?.message}
                required
              />

              <DatePicker
                label="Period End"
                {...register('period_end', {
                  validate: (value) => {
                    const requiredError = validateField(value, 'Period End')
                    if (requiredError) return requiredError
                    return validatePeriodEnd(value)
                  },
                })}
                error={errors.period_end?.message}
                min={periodStart}
                required
              />
            </div>

            <Input
              id="tax"
              type="number"
              step="0.01"
              label="Tax"
              placeholder="0.00"
              {...register('tax')}
            />

            <input type="hidden" {...register('status')} value="draft" />
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
                <DocumentPlusIcon className="w-4 h-4" />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateInvoiceModal
