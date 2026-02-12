import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import * as userroleService from '../../services/userrole.service'
import * as userService from '../../services/user.service'
import { useBusiness } from '../../hooks/useBusiness'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchableSelect from '../../components/ui/SearchableSelect'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { validateRequired } from '../../utils/validators'
import { ROLES } from '../../constants/roles'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const RoleListPage = () => {
  const { activeBusiness } = useBusiness()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const {
    data: userroles = [],
    isLoading,
    refetch,
  } = useApiQuery(
    () => userroleService.getAll({ business_key: activeBusiness?.business_key }),
    [activeBusiness?.business_key]
  )

  const handleAssignRole = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveRole = async (roleData) => {
    try {
      await userroleService.create({
        ...roleData,
        business_key: activeBusiness.business_key,
      })
      showToast('Role assigned successfully', 'success')
      refetch()
      handleCloseModal()
    } catch (error) {
      if (error.response?.status === 409) {
        showToast('This user already has this role for this business', 'error')
      } else {
        showToast('Failed to assign role', 'error')
      }
    }
  }

  const handleBulkRemove = async () => {
    try {
      await Promise.all(selectedRows.map((row) => userroleService.remove(row.original.key)))
      showToast(
        `${selectedRows.length} role${selectedRows.length > 1 ? 's' : ''} removed successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to remove roles', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(userroles, columns, 'user-roles')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(userroles, columns, 'User Roles Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'user_name',
      header: 'User',
      cell: ({ row }) => `${row.original.user?.first_name} ${row.original.user?.last_name}`,
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge status="active">{row.original.role}</Badge>,
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.role === filterValue
      },
    },
    {
      accessorKey: 'business_name',
      header: 'Business',
      cell: ({ row }) => row.original.business?.name || activeBusiness?.name,
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatters.formatRelativeDate(new Date(row.original.created_at)),
      enableSorting: true,
    },
  ]

  const emptyState = {
    title: 'No roles assigned',
    description: 'Assign roles to users to control their access within the business.',
    action: {
      label: 'Assign Role',
      onClick: handleAssignRole,
    },
  }

  const bulkActions =
    selectedRows.length > 0 ? (
      <Button onClick={handleBulkRemove} variant="destructive" className="flex items-center gap-2">
        <TrashIcon className="h-4 w-4" />
        Remove {selectedRows.length} Role{selectedRows.length > 1 ? 's' : ''}
      </Button>
    ) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        <Button onClick={handleAssignRole} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Assign Role
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={userroles}
        isLoading={isLoading}
        emptyState={emptyState}
        enableSelection={true}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        bulkActions={bulkActions}
        onSelectionChange={setSelectedRows}
        initialColumnFilters={[
          {
            id: 'role',
            value: '',
          },
        ]}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <AssignRoleModal
          activeBusiness={activeBusiness}
          onSave={handleSaveRole}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

const AssignRoleModal = ({ activeBusiness, onSave, onClose }) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      user_key: '',
      role: '',
    },
  })

  const selectedUserKey = watch('user_key')

  const loadUsers = async (searchTerm) => {
    try {
      const users = await userService.getAll({
        business_key: activeBusiness.business_key,
        search: searchTerm,
      })
      return users.map((user) => ({
        value: user.key,
        label: `${user.first_name} ${user.last_name} (${user.email})`,
      }))
    } catch {
      return []
    }
  }

  const validateField = (value, fieldName) => {
    const error = validateRequired(value, fieldName)
    return error
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      // Error handled in parent
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    { value: ROLES.OWNER, label: 'Owner' },
    { value: ROLES.MANAGER, label: 'Manager' },
    { value: ROLES.WORKER, label: 'Worker' },
    { value: ROLES.CUSTOMER, label: 'Customer' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title="Assign Role" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User */}
        <SearchableSelect
          label="User"
          value={selectedUserKey}
          onChange={(value) => setValue('user_key', value)}
          loadOptions={loadUsers}
          placeholder="Search for a user..."
          error={errors.user_key?.message}
          required
        />

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role <span className="text-red-500">*</span>
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

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default RoleListPage
