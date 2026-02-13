import React, { useState } from 'react'
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { getAll as getUsers } from '../../services/user.service'
import Select from '../ui/Select'
import SearchableSelect from '../ui/SearchableSelect'
import { useToast } from '../../hooks/useToast'
import { validateRequired } from '../../utils/validators'
import { ROLES } from '../../constants/roles'

const AssignRoleModal = ({ isOpen, onClose, onSuccess }) => {
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
    defaultValues: {
      user_key: '',
      role: '',
    },
  })

  const selectedUserKey = watch('user_key')

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const loadUsers = async (searchTerm) => {
    try {
      const users = await getUsers({ search: searchTerm })
      return users.map((user) => ({
        value: user.key,
        label: `${user.first_name} ${user.last_name} (${user.email})`,
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
      showToast('Failed to assign role', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const roleOptions = [
    { value: ROLES.OWNER, label: 'Owner' },
    { value: ROLES.MANAGER, label: 'Manager' },
    { value: ROLES.WORKER, label: 'Worker' },
    { value: ROLES.CUSTOMER, label: 'Customer' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) onClose()
        }}
      />
      <div className="relative bg-bg-card rounded-xl shadow-xl border border-border/50 w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <UserIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Assign Role</h2>
              <p className="text-sm text-text-tertiary">
                Assign a role to a user within your business
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
              label="User"
              value={selectedUserKey}
              onChange={(value) => setValue('user_key', value)}
              loadOptions={loadUsers}
              placeholder="Search for a user..."
              error={errors.user_key?.message}
              required
            />

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-1">
                Role <span className="text-danger">*</span>
              </label>
              <Select
                id="role"
                {...register('role', {
                  validate: (value) => validateField(value, 'Role'),
                })}
                error={errors.role?.message}
                options={roleOptions}
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
                Assigning...
              </>
            ) : (
              <>Assign Role</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignRoleModal
