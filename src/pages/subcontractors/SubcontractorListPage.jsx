import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../../hooks/useBusiness'
import { useApiQuery } from '../../hooks/useApiQuery'
import {
  getSubcontractors,
  addSubcontractor,
  removeSubcontractor,
  getAll as getAllBusinesses,
} from '../../services/business.service'
import DataTable from '../../components/data-table/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SearchableSelect from '../../components/ui/SearchableSelect'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const SubcontractorListPage = () => {
  const navigate = useNavigate()
  const { activeBusiness } = useBusiness()
  const { showToast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedSubcontractor, setSelectedSubcontractor] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState('')

  const {
    data: subcontractors = [],
    isLoading,
    refetch,
  } = useApiQuery(
    () => (activeBusiness ? getSubcontractors(activeBusiness.business_key) : Promise.resolve([])),
    [activeBusiness?.business_key]
  )

  const handleRowClick = (row) => {
    navigate(`/subcontractors/${row.original.business_key}`)
  }

  const handleAddSubcontractor = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setSelectedBusiness('')
  }

  const handleSaveAddSubcontractor = async () => {
    if (!selectedBusiness) return

    try {
      await addSubcontractor(activeBusiness.business_key, selectedBusiness)
      showToast('Subcontractor added successfully', 'success')
      refetch()
      handleCloseAddModal()
    } catch {
      showToast('Failed to add subcontractor', 'error')
    }
  }

  const handleRemoveSubcontractor = (subcontractor) => {
    setSelectedSubcontractor(subcontractor)
    setShowRemoveDialog(true)
  }

  const handleConfirmRemove = async () => {
    try {
      await removeSubcontractor(activeBusiness.business_key, selectedSubcontractor.business_key)
      showToast('Subcontractor removed successfully', 'success')
      setShowRemoveDialog(false)
      setSelectedSubcontractor(null)
      refetch()
    } catch {
      showToast('Failed to remove subcontractor', 'error')
    }
  }

  const loadBusinessOptions = async (search) => {
    try {
      const businesses = await getAllBusinesses({ search })
      return businesses
        .filter(
          (b) =>
            b.key !== activeBusiness.business_key &&
            !subcontractors.some((s) => s.business_key === b.key)
        )
        .map((b) => ({ value: b.key, label: b.name }))
    } catch {
      return []
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Business Name',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
      enableSorting: true,
      meta: {
        type: 'select',
        options: [
          { value: 'contractor', label: 'Contractor' },
          { value: 'supplier', label: 'Supplier' },
        ],
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
      meta: {
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'archived', label: 'Archived' },
        ],
      },
    },
    {
      accessorKey: 'work_orders_count',
      header: 'Work Orders',
      cell: ({ row }) => row.original.work_orders_count || 0,
      enableSorting: true,
    },
    {
      accessorKey: 'active_since',
      header: 'Active Since',
      cell: ({ row }) => formatters.formatDate(new Date(row.original.active_since)),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleRemoveSubcontractor(row.original)
          }}
          className="text-red-600 hover:text-red-800"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      size: 80,
    },
  ]

  const emptyState = {
    title: 'No subcontractors found',
    description: 'Get started by adding your first subcontractor.',
    action: {
      label: '+ Add Subcontractor',
      onClick: handleAddSubcontractor,
    },
  }

  if (!activeBusiness) {
    return <div>Please select a business</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subcontractors</h1>
        <Button onClick={handleAddSubcontractor} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />+ Add Subcontractor
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={subcontractors}
        isLoading={isLoading}
        emptyState={emptyState}
        onRowClick={handleRowClick}
      />

      {/* Add Subcontractor Modal */}
      {showAddModal && (
        <Modal isOpen={true} onClose={handleCloseAddModal} title="Add Subcontractor">
          <div className="space-y-4">
            <SearchableSelect
              label="Search Business"
              value={selectedBusiness}
              onChange={setSelectedBusiness}
              loadOptions={loadBusinessOptions}
              placeholder="Type to search businesses..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCloseAddModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveAddSubcontractor} disabled={!selectedBusiness}>
                Add
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Subcontractor"
        description={`Are you sure you want to remove ${selectedSubcontractor?.name}? This will affect ${selectedSubcontractor?.work_orders_count || 0} active work orders.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  )
}

export default SubcontractorListPage
