import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userService } from '../../services/user.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import InviteUserModal from '../../components/modals/InviteUserModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, EyeIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

const UserListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const { data, isLoading, refetch } = useApiQuery(userService.getAll)

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('')
    setRoleFilter('')
  }

  const usersData = useMemo(() => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.values)) return data.values
    return []
  }, [data])

  const filteredUsers = useMemo(() => {
    let filtered = usersData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(lowerSearch) ||
          user.last_name?.toLowerCase().includes(lowerSearch) ||
          user.email?.toLowerCase().includes(lowerSearch) ||
          user.user_name?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.roles?.includes(roleFilter))
    }

    return filtered
  }, [usersData, searchTerm, statusFilter, roleFilter])

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
      showToast('User invited successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to invite user', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredUsers, columns, 'users')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredUsers, columns, 'Users Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.email}</div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'user_name',
      header: 'Username',
      cell: ({ row }) => (
        <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
          {row.original.user_name}
        </code>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors = {
          active: 'bg-green-600',
          inactive: 'bg-yellow-600',
          archived: 'bg-gray-600',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
              statusColors[status] || 'bg-gray-600'
            }`}
          >
            {status}
          </span>
        )
      },
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
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => formatters.formatPhone(row.original.phone),
    },
    {
      accessorKey: 'created_dt',
      header: 'Created',
      cell: ({ row }) =>
        row.original.created_dt
          ? formatters.formatDateTime(new Date(row.original.created_dt * 1000))
          : 'N/A',
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/users/${user.key}`)
            }}
            className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )
      },
      enableSorting: false,
    },
  ]

  const hasActiveFilters = searchTerm || statusFilter || roleFilter

  const uniqueRoles = useMemo(() => {
    const roles = new Set()
    usersData.forEach((user) => {
      user.roles?.forEach((role) => roles.add(role))
    })
    return Array.from(roles).sort()
  }, [usersData])

  return (
    <div data-testid="users-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserIcon className="h-8 w-8 text-blue-600" />
                Users
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your users ({filteredUsers.length} of {usersData.length || 0} total)
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
              <Button
                onClick={handleCreateUser}
                data-testid="create-user-button"
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={false}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by name, email, or username...',
            searchValue: searchInput,
            onSearchChange: handleSearchInputChange,
            advancedFilters: [
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'archived', label: 'Archived' },
                ],
              },
              {
                id: 'role',
                label: 'Role',
                value: roleFilter,
                onChange: (e) => setRoleFilter(e.target.value),
                options: [
                  { value: '', label: 'All Roles' },
                  ...uniqueRoles.map((role) => ({ value: role, label: role })),
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
        />

        {showCreateModal && (
          <InviteUserModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveUser}
          />
        )}
      </div>
    </div>
  )
}

export default UserListPage
