import React, { useState } from 'react'
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useToast } from '../../hooks/useToast'
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators'
import { userService } from '../../services/user.service'

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      user_name: user?.user_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      status: user?.status || 'active',
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
      await userService.update(user.key, data)
      showToast('User updated successfully', 'success')
      if (onSuccess) onSuccess(data)
      reset()
    } catch {
      showToast('Failed to update user', 'error')
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
              <UserIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Edit User</h2>
              <p className="text-sm text-text-tertiary">Update user information</p>
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="First Name"
                placeholder="John"
                required
                {...register('first_name', {
                  validate: (value) => validateField(value, 'First name'),
                })}
                error={errors.first_name?.message}
              />
              <Input
                id="last_name"
                label="Last Name"
                placeholder="Doe"
                required
                {...register('last_name', {
                  validate: (value) => validateField(value, 'Last name'),
                })}
                error={errors.last_name?.message}
              />
            </div>

            <Input
              id="user_name"
              label="Username"
              placeholder="john.doe"
              required
              {...register('user_name', { validate: (value) => validateField(value, 'Username') })}
              error={errors.user_name?.message}
              disabled
            />
            <p className="text-sm text-text-muted -mt-3">
              Username cannot be changed after creation
            </p>

            <div className="relative">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="john@example.com"
                required
                {...register('email', {
                  validate: (value) => validateField(value, 'Email', validateEmail),
                })}
                error={errors.email?.message}
              />
              <EnvelopeIcon className="w-4 h-4 absolute right-3 top-[34px] text-text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                id="phone"
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                {...register('phone', {
                  validate: (value) => (value ? validatePhone(value) : null),
                })}
                error={errors.phone?.message}
              />
              <PhoneIcon className="w-4 h-4 absolute right-3 top-[34px] text-text-muted pointer-events-none" />
            </div>

            <Select
              id="status"
              label="Account Status"
              required
              {...register('status', { validate: (value) => validateField(value, 'Status') })}
              error={errors.status?.message}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'archived', label: 'Archived' },
              ]}
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
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal
