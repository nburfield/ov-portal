import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userService } from '../../services/user.service'
import { userserviceService } from '../../services/userservice.service'
import { userroleService } from '../../services/userrole.service'
import { worktaskService } from '../../services/worktask.service'
import { useBusiness } from '../../hooks/useBusiness'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { ROLES } from '../../constants/roles'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormActions from '../../components/forms/FormActions'
import DataTable from '../../components/data-table/DataTable'
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const UserDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { activeBusiness } = useBusiness()

  const [activeTab, setActiveTab] = useState('details')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useApiQuery(() => userService.getByKey(key))

  const {
    data: userRoles = [],
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useApiQuery(
    () => userroleService.getAll({ user_key: key, business_key: activeBusiness?.business_key }),
    { enabled: !!activeBusiness }
  )

  const {
    data: certifications = [],
    isLoading: certsLoading,
    refetch: _refetchCerts,
  } = useApiQuery(() => userserviceService.getAll({ user_key: key }), { enabled: !!user })

  const {
    data: workTasks = [],
    isLoading: tasksLoading,
    refetch: _refetchTasks,
  } = useApiQuery(() => worktaskService.getAll({ assigned_user_key: key }), { enabled: !!user })

  const handleBack = () => {
    navigate('/users')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(user?.key || '')
      showSuccess('User key copied to clipboard')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = user?.key || ''
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (success) {
        showSuccess('User key copied to clipboard')
      } else {
        showError('Failed to copy user key')
      }
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
      await userService.remove(key)
      showSuccess('User deleted successfully')
      navigate('/users')
    } catch {
      showError('Failed to delete user')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleRefresh = async () => {
    setLocalLoading(true)
    try {
      await refetchUser()
      await refetchRoles()
    } finally {
      setLocalLoading(false)
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'roles', label: 'Roles' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'work-history', label: 'Work History' },
  ]

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
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
              <span className="text-gray-600 dark:text-gray-400">Loading user...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            User not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="user-detail-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[user.status] || statusColors.inactive}`}
                >
                  {user.status || 'N/A'}
                </span>
              </div>
              {user.key && (
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="block text-xs text-gray-400 dark:text-gray-500 truncate cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none mt-1"
                  title="Click to copy user key"
                >
                  {user.key}
                </button>
              )}
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button
                variant="tertiary"
                onClick={handleBack}
                data-testid="back-button"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={localLoading}
                className="flex items-center gap-2"
              >
                {localLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                ) : (
                  <ArrowPathIcon className="h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button
                variant="primary"
                onClick={handleEdit}
                data-testid="user-edit-button"
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'details' && <DetailsTab user={user} />}
          {activeTab === 'roles' && (
            <RolesTab
              user={user}
              userRoles={userRoles}
              isLoading={rolesLoading}
              refetchRoles={refetchRoles}
              onAddRole={() => setShowAddRoleModal(true)}
            />
          )}
          {activeTab === 'certifications' && (
            <CertificationsTab certifications={certifications} isLoading={certsLoading} />
          )}
          {activeTab === 'work-history' && (
            <WorkHistoryTab workTasks={workTasks} isLoading={tasksLoading} />
          )}
        </div>

        {showEditModal && (
          <EditUserModal
            user={user}
            onSave={async () => {
              await refetchUser()
              setShowEditModal(false)
            }}
            onClose={() => setShowEditModal(false)}
          />
        )}

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          description={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
          confirmLabel="Delete User"
          variant="danger"
        />

        {showAddRoleModal && (
          <AddRoleModal
            user={user}
            existingRoles={(Array.isArray(userRoles) ? userRoles : []).map((ur) => ur.role)}
            onSave={async (role) => {
              await userroleService.create({
                user_key: user.key,
                business_key: activeBusiness.business_key,
                role,
              })
              refetchRoles()
              setShowAddRoleModal(false)
            }}
            onClose={() => setShowAddRoleModal(false)}
          />
        )}
      </div>
    </div>
  )
}

const DetailsTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              data-testid="user-detail-first-name"
              value={user.first_name || 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={user.last_name || 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={user.user_name || 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-mono"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="text"
              data-testid="user-detail-email"
              value={user.email || 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="text"
              data-testid="user-detail-phone"
              value={user.phone ? formatters.formatPhone(user.phone) : 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : user.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}
              >
                {user.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Created At
            </label>
            <input
              type="text"
              value={user.created_at ? formatters.formatDateTime(user.created_at) : 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Updated At
            </label>
            <input
              type="text"
              value={user.updated_at ? formatters.formatDateTime(user.updated_at) : 'N/A'}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const RolesTab = ({ user, userRoles, isLoading, refetchRoles, onAddRole }) => {
  const { showSuccess, showError } = useToast()
  const [showRemoveDialog, setShowRemoveDialog] = useState(null)

  const handleRemoveRole = (userRole) => {
    setShowRemoveDialog(userRole)
  }

  const handleConfirmRemove = async () => {
    try {
      await userroleService.remove(showRemoveDialog.key)
      showSuccess('Role removed successfully')
      refetchRoles()
    } catch {
      showError('Failed to remove role')
    } finally {
      setShowRemoveDialog(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3
            data-testid="tab-roles"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Roles
          </h3>
          <Button
            onClick={onAddRole}
            data-testid="add-role-button"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Role
          </Button>
        </div>
        <div data-testid="user-roles-list" className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
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
            </div>
          ) : Array.isArray(userRoles) && userRoles.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {userRoles.map((userRole) => (
                <div
                  key={userRole.key}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {userRole.role}
                    </span>
                    {userRole.business_name && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {userRole.business_name}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveRole(userRole)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No roles assigned</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!showRemoveDialog}
        onClose={() => setShowRemoveDialog(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Role"
        description={`Are you sure you want to remove the ${showRemoveDialog?.role} role from ${user.first_name} ${user.last_name}?`}
        confirmLabel="Remove Role"
        variant="danger"
      />
    </div>
  )
}

const CertificationsTab = ({ certifications, isLoading }) => {
  const columns = [
    {
      accessorKey: 'service_name',
      header: 'Service Name',
    },
    {
      accessorKey: 'certified_date',
      header: 'Certified Date',
      cell: ({ row }) => formatters.formatDate(row.original.certified_date),
    },
    {
      accessorKey: 'expiration_date',
      header: 'Expiration Date',
      cell: ({ row }) => formatters.formatDate(row.original.expiration_date),
    },
  ]

  return (
    <DataTable
      data-testid="tab-certifications"
      columns={columns}
      data={certifications}
      isLoading={isLoading}
      emptyState={{
        title: 'No certifications found',
        description: 'This user has no certifications.',
      }}
    />
  )
}

const WorkHistoryTab = ({ workTasks, isLoading }) => {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Task Title',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
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
      data-testid="tab-worktasks"
      columns={columns}
      data={workTasks}
      isLoading={isLoading}
      emptyState={{
        title: 'No work history found',
        description: 'This user has no assigned work tasks.',
      }}
    />
  )
}

const EditUserModal = ({ user, onSave, onClose }) => {
  const { showSuccess, showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      user_name: user.user_name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active',
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
      await userService.update(user.key, data)
      showSuccess('User updated successfully')
      onSave(data)
    } catch {
      showError('Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-text-primary mb-1">
            First Name <span className="text-danger">*</span>
          </label>
          <Input
            id="first_name"
            {...register('first_name', {
              validate: (value) => validateField(value, 'First name'),
            })}
            error={errors.first_name?.message}
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-text-primary mb-1">
            Last Name <span className="text-danger">*</span>
          </label>
          <Input
            id="last_name"
            {...register('last_name', {
              validate: (value) => validateField(value, 'Last name'),
            })}
            error={errors.last_name?.message}
          />
        </div>

        <div>
          <label htmlFor="user_name" className="block text-sm font-medium text-text-primary mb-1">
            Username <span className="text-danger">*</span>
          </label>
          <Input
            id="user_name"
            {...register('user_name', {
              validate: (value) => validateField(value, 'Username'),
            })}
            error={errors.user_name?.message}
            disabled
          />
          <p className="text-sm text-text-tertiary mt-1">
            Username cannot be changed after creation
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            Email <span className="text-danger">*</span>
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

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
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

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1">
            Status <span className="text-danger">*</span>
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

const AddRoleModal = ({ user, existingRoles, onSave, onClose }) => {
  const { showSuccess, showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const availableRoles = Object.values(ROLES).filter((role) => !existingRoles.includes(role))

  const handleSave = async () => {
    if (!selectedRole) {
      showError('Please select a role')
      return
    }

    setIsLoading(true)
    try {
      await onSave(selectedRole)
      showSuccess('Role added successfully')
    } catch {
      showError('Failed to add role')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Add Role to ${user.first_name} ${user.last_name}`}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-1">
            Role <span className="text-danger">*</span>
          </label>
          <Select
            id="role"
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            options={availableRoles.map((role) => ({ value: role, label: role }))}
            placeholder="Select a role"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isLoading}>
            Add Role
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default UserDetailPage
