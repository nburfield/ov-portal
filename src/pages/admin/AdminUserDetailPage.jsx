import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userService } from '../../services/user.service'
import { useToast } from '../../hooks/useToast'
import Tabs from '../../components/ui/Tabs'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import DataTable from '../../components/data-table/DataTable'
import { formatters } from '../../utils/formatters'
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const AdminUserDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('details')

  const { data: user, isLoading } = useApiQuery(() => userService.getByKey(key), { enabled: !!key })

  const handleBack = () => {
    navigate('/admin/users')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(user?.key || '')
      showToast('User key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy user key', 'error')
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'businesses', label: 'Business Memberships' },
    { key: 'roles', label: 'All Roles' },
  ]

  if (isLoading) {
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
        <div className="text-sm text-gray-500">Super Admin View</div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && <DetailsTab user={user} />}
        {activeTab === 'businesses' && (
          <BusinessesTab businesses={user.business_memberships || []} />
        )}
        {activeTab === 'roles' && <RolesTab roles={user.all_roles || []} />}
      </div>
    </div>
  )
}

// Details Tab Component
const DetailsTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">User Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <p className="text-gray-900 dark:text-gray-100">{user.first_name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <p className="text-gray-900 dark:text-gray-100">{user.last_name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            {user.user_name}
          </code>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <p className="text-gray-900 dark:text-gray-100">
            {user.phone ? formatters.formatPhone(user.phone) : 'N/A'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Badge status={user.status}>{user.status}</Badge>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Created</label>
          <p className="text-gray-900 dark:text-gray-100">
            {formatters.formatDate(user.created_at)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Updated</label>
          <p className="text-gray-900 dark:text-gray-100">
            {formatters.formatDate(user.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

// Businesses Tab Component
const BusinessesTab = ({ businesses }) => {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Business Name',
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'roles',
      header: 'Roles in Business',
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
      accessorKey: 'joined_at',
      header: 'Joined',
      cell: ({ row }) => formatters.formatDate(row.original.joined_at),
      enableSorting: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserGroupIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Business Memberships</h2>
      </div>

      <DataTable
        data={businesses}
        columns={columns}
        emptyState={{
          title: 'No business memberships',
          description: 'This user is not a member of any businesses.',
        }}
      />
    </div>
  )
}

// Roles Tab Component
const RolesTab = ({ roles }) => {
  const columns = [
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge status="active">{row.original.role}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'business_name',
      header: 'Business',
      enableSorting: true,
    },
    {
      accessorKey: 'business_type',
      header: 'Business Type',
      cell: ({ row }) => <Badge>{row.original.business_type}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'assigned_at',
      header: 'Assigned',
      cell: ({ row }) => formatters.formatDate(row.original.assigned_at),
      enableSorting: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheckIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">All Roles Across Platform</h2>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        emptyState={{
          title: 'No roles assigned',
          description: 'This user has no roles assigned in any business.',
        }}
      />
    </div>
  )
}

export default AdminUserDetailPage
