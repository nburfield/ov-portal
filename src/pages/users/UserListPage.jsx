import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userService } from '../../services/user.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
} from '../../utils/validators'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/outline'

const UserListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: users = [], isLoading, refetch } = useApiQuery(userService.getAll)

  const handleRowClick = (row) => {
    navigate(`/users/${row.original.key}`)
  }

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveUser = async (userData) => {
    try {
      await userService.create(userData)
      showToast('User created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save user', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(users, columns, 'users')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(users, columns, 'Users Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'first_name',
      header: 'Name',
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
      enableSorting: true,
    },
    {
      accessorKey: 'user_name',
      header: 'Username',
      cell: ({ row }) => <code className="font-mono text-sm">{row.original.user_name}</code>,
      enableSorting: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => formatters.formatPhone(row.original.phone),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'roles',
      header: 'Role(s)',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.map((role) => (
            <Badge key={role} status="active">
              {role}
            </Badge>
          )) || 'No roles'}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No users found',
    description: 'Get started by inviting your first user.',
    action: {
      label: 'Invite User',
      onClick: handleCreateUser,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <UserFormModal user={null} onSave={handleSaveUser} onClose={handleCloseModal} />
      )}
    </div>
  )
}

const UserFormModal = ({ user, onSave, onClose }) => {
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: user
      ? {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          user_name: user.user_name || '',
          email: user.email || '',
          phone: user.phone || '',
          status: user.status || 'active',
        }
      : {
          first_name: '',
          last_name: '',
          user_name: '',
          email: '',
          phone: '',
          password: '',
          status: 'active',
        },
  })

  const validateField = (value, fieldName, validator) => {
    const requiredError = validateRequired(value, fieldName)
    if (requiredError) return requiredError

    if (validator) {
      return validator(value)
    }
    return null
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save user', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!user

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit User' : 'Invite User'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="first_name"
            {...register('first_name', {
              validate: (value) => validateField(value, 'First name'),
            })}
            error={errors.first_name?.message}
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="last_name"
            {...register('last_name', {
              validate: (value) => validateField(value, 'Last name'),
            })}
            error={errors.last_name?.message}
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="user_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Username <span className="text-red-500">*</span>
          </label>
          <Input
            id="user_name"
            {...register('user_name', {
              validate: (value) => validateField(value, 'Username'),
            })}
            error={errors.user_name?.message}
            disabled={isEdit} // Not editable after creation
          />
          {isEdit && (
            <p className="text-sm text-gray-500 mt-1">Username cannot be changed after creation</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              validate: (value) => validateField(value, 'Email', validateEmail),
            })}
            error={errors.email?.message}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            {...register('phone', {
              validate: (value) => (value ? validatePhone(value) : null),
            })}
            error={errors.phone?.message}
          />
        </div>

        {/* Password - only for create */}
        {!isEdit && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  validate: (value) => validateField(value, 'Password', validatePassword),
                })}
                error={errors.password?.message}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}

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
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default UserListPage
