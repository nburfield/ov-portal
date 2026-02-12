import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userService } from '../../services/user.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { UsersIcon } from '@heroicons/react/24/outline'

const AdminUserListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: users = [], isLoading, refetch } = useApiQuery(userService.getAll)

  const handleRowClick = (row) => {
    navigate(`/admin/users/${row.original.key}`)
  }

  const handleStatusChange = async (userKey, newStatus) => {
    try {
      await userService.update(userKey, { status: newStatus })
      showToast(`User ${newStatus} successfully`, 'success')
      refetch()
    } catch {
      showToast('Failed to update user status', 'error')
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'businesses_count',
      header: 'Businesses',
      cell: ({ row }) => row.original.businesses_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
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
      cell: ({ row }) => formatters.formatDate(row.original.created_at),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Select
            value={row.original.status}
            onChange={(value) => handleStatusChange(row.original.key, value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
            className="w-32"
          />
        </div>
      ),
      enableSorting: false,
    },
  ]

  const emptyState = {
    title: 'No users found',
    description: 'No users are currently registered on the platform.',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin - Users</h1>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
      />
    </div>
  )
}

export default AdminUserListPage
