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
import { STATUS_COLORS } from '../../constants/statuses'
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
} from '@heroicons/react/24/outline'

const UserDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { activeBusiness } = useBusiness()

  const [activeTab, setActiveTab] = useState('details')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)

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
      showToast('User key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy user key', 'error')
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
      showToast('User deleted successfully', 'success')
      navigate('/users')
    } catch {
      showToast('Failed to delete user', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'roles', label: 'Roles' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'work-history', label: 'Work History' },
  ]

  if (userLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge status={user.status}>{user.status}</Badge>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <code className="font-mono">{user.key}</code>
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex items-center gap-2">
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
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

      {/* Edit Modal */}
      {showEditModal && (
        <EditUserModal
          user={user}
          onSave={async () => {
            // TODO: Implement save
            await refetchUser()
            setShowEditModal(false)
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
      />

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <AddRoleModal
          user={user}
          existingRoles={userRoles.map((ur) => ur.role)}
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
  )
}

const DetailsTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{user.first_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{user.last_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">{user.user_name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {user.phone ? formatters.formatPhone(user.phone) : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Badge status={user.status}>{user.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Created At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(user.created_at)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Updated At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(user.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const RolesTab = ({ user, userRoles, isLoading, refetchRoles, onAddRole }) => {
  const { showToast } = useToast()
  const [showRemoveDialog, setShowRemoveDialog] = useState(null)

  const handleRemoveRole = (userRole) => {
    setShowRemoveDialog(userRole)
  }

  const handleConfirmRemove = async () => {
    try {
      await userroleService.remove(showRemoveDialog.key)
      showToast('Role removed successfully', 'success')
      refetchRoles()
    } catch {
      showToast('Failed to remove role', 'error')
    } finally {
      setShowRemoveDialog(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Roles</h3>
        <Button onClick={onAddRole} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Role
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {userRoles.map((userRole) => (
          <div key={userRole.key} className="flex items-center gap-2">
            <Badge status="active">{userRole.role}</Badge>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveRole(userRole)}>
              Remove
            </Button>
          </div>
        ))}
        {userRoles.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500">No roles assigned</p>
        )}
      </div>

      {/* Remove Role Confirmation */}
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
  const { showToast } = useToast()
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
      showToast('User updated successfully', 'success')
      onSave(data)
    } catch {
      showToast('Failed to update user', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit User">
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
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">Username cannot be changed after creation</p>
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

const AddRoleModal = ({ user, existingRoles, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const availableRoles = Object.values(ROLES).filter((role) => !existingRoles.includes(role))

  const handleSave = async () => {
    if (!selectedRole) {
      showToast('Please select a role', 'error')
      return
    }

    setIsLoading(true)
    try {
      await onSave(selectedRole)
      showToast('Role added successfully', 'success')
    } catch {
      showToast('Failed to add role', 'error')
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
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role <span className="text-red-500">*</span>
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
