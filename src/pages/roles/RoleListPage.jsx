import React, { useState, useMemo } from 'react'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userroleService } from '../../services/userrole.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import AssignRoleModal from '../../components/modals/AssignRoleModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, PlusIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'
import { ROLES } from '../../constants/roles'

const RoleListPage = () => {
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  const {
    data: userroles = [],
    isLoading,
    refetch,
  } = useApiQuery(() => userroleService.getAll(), [])

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setRoleFilter('')
  }

  const filteredRoles = useMemo(() => {
    let filtered = Array.isArray(userroles) ? userroles : []

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (role) =>
          role.user_name?.toLowerCase().includes(lowerSearch) ||
          `${role.user?.first_name} ${role.user?.last_name}`.toLowerCase().includes(lowerSearch) ||
          role.role?.toLowerCase().includes(lowerSearch)
      )
    }

    if (roleFilter) {
      filtered = filtered.filter((role) => role.role === roleFilter)
    }

    return filtered
  }, [userroles, searchTerm, roleFilter])

  const handleAssignRole = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveRole = async (roleData) => {
    try {
      await userroleService.create(roleData)
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
      exportToCSV(filteredRoles, columns, 'user-roles')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredRoles, columns, 'User Roles Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'user_name',
      header: 'User',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.user?.first_name} {row.original.user?.last_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.user?.email}</div>
        </div>
      ),
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
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) =>
        row.original.created_at
          ? formatters.formatDateTime(new Date(row.original.created_at * 1000))
          : 'N/A',
      enableSorting: true,
    },
  ]

  const hasActiveFilters = searchTerm || roleFilter

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: ROLES.OWNER, label: 'Owner' },
    { value: ROLES.MANAGER, label: 'Manager' },
    { value: ROLES.WORKER, label: 'Worker' },
    { value: ROLES.CUSTOMER, label: 'Customer' },
  ]

  const bulkActions =
    selectedRows.length > 0 ? (
      <Button onClick={handleBulkRemove} variant="destructive" className="flex items-center gap-2">
        <TrashIcon className="h-4 w-4" />
        Remove {selectedRows.length} Role{selectedRows.length > 1 ? 's' : ''}
      </Button>
    ) : null

  return (
    <div data-testid="roles-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                Roles
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage role assignments ({filteredRoles.length} of {userroles.length || 0} total)
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refetch()}
                variant="secondary"
                className="inline-flex items-center"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleAssignRole} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredRoles}
          isLoading={isLoading}
          enableSelection={true}
          onSelectionChange={setSelectedRows}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          bulkActions={bulkActions}
          filterBar={{
            searchPlaceholder: 'Search by user or role...',
            searchValue: searchInput,
            onSearchChange: handleSearchInputChange,
            advancedFilters: [
              {
                id: 'role',
                label: 'Role',
                value: roleFilter,
                onChange: (e) => setRoleFilter(e.target.value),
                options: roleOptions,
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
        />

        {showCreateModal && (
          <AssignRoleModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveRole}
          />
        )}
      </div>
    </div>
  )
}

export default RoleListPage
