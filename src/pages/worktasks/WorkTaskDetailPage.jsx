import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { getByKey } from '../../services/worktask.service'
import { getAll as getFleetAssets } from '../../services/fleetasset.service'
import { getByKey as getInvoiceByKey } from '../../services/invoice.service'
import { getByKey as getInvoiceLineItemByKey } from '../../services/invoicelineitem.service'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { Modal } from '../../components/ui/Modal'
import { DataTable } from '../../components/data-table/DataTable'
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

const WorkTaskDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('details')
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const { data: workTask, isLoading: workTaskLoading } = useApiQuery(() => getByKey(key))

  const { data: fleetAssets = [], isLoading: assetsLoading } = useApiQuery(
    () => getFleetAssets({ worktask_key: key }),
    { enabled: !!workTask }
  )

  const { data: invoice, isLoading: invoiceLoading } = useApiQuery(
    () =>
      workTask?.invoice_line_item_key
        ? getInvoiceByKey(workTask.invoice_key)
        : Promise.resolve(null),
    { enabled: !!workTask && !!workTask.invoice_line_item_key }
  )

  const { data: invoiceLineItem, isLoading: lineItemLoading } = useApiQuery(
    () =>
      workTask?.invoice_line_item_key
        ? getInvoiceLineItemByKey(workTask.invoice_line_item_key)
        : Promise.resolve(null),
    { enabled: !!workTask && !!workTask.invoice_line_item_key }
  )

  const handleBack = () => {
    navigate('/worktasks')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(workTask?.key || '')
      showToast('Work task key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy work task key', 'error')
    }
  }

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo)
    setShowPhotoModal(true)
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'photos', label: 'Photos' },
    { key: 'assets-used', label: 'Assets Used' },
    { key: 'invoice-link', label: 'Invoice Link' },
  ]

  if (workTaskLoading) {
    return <div>Loading...</div>
  }

  if (!workTask) {
    return <div>Work task not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Work Tasks
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Work Task {workTask.key}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge status={workTask.status}>{workTask.status}</Badge>
              <button
                onClick={handleCopyKey}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <code className="font-mono">{workTask.key}</code>
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && <DetailsTab workTask={workTask} />}
        {activeTab === 'photos' && (
          <PhotosTab workTask={workTask} onPhotoClick={handlePhotoClick} />
        )}
        {activeTab === 'assets-used' && (
          <AssetsUsedTab fleetAssets={fleetAssets} isLoading={assetsLoading} />
        )}
        {activeTab === 'invoice-link' && (
          <InvoiceLinkTab
            invoice={invoice}
            invoiceLineItem={invoiceLineItem}
            isLoading={invoiceLoading || lineItemLoading}
          />
        )}
      </div>

      {/* Photo Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Photo</h3>
          {selectedPhoto && (
            <img src={selectedPhoto.url} alt="Full size" className="max-w-full h-auto" />
          )}
        </div>
      </Modal>
    </div>
  )
}

const DetailsTab = ({ workTask }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">{workTask.key}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Badge status={workTask.status}>{workTask.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Work Order Key
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">
            {workTask.work_order_key}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Worker
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{workTask.worker_name}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Service Snapshot (Read-only)
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-900 dark:text-white">
              {workTask.service_snapshot
                ? JSON.stringify(workTask.service_snapshot, null, 2)
                : 'N/A'}
            </p>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Snapshot (Read-only)
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-900 dark:text-white">
              {formatters.formatCurrency(workTask.price_snapshot || 0)}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Performed Date
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(new Date(workTask.performed_at))}
          </p>
        </div>
        {(workTask.status === 'missed' || workTask.status === 'cancelled') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason
            </label>
            <p className="text-sm text-gray-900 dark:text-white">{workTask.reason || 'N/A'}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Created At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(workTask.created_at)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Updated At
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatDateTime(workTask.updated_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

const PhotosTab = ({ workTask, onPhotoClick }) => {
  // Assume photos are part of workTask or fetched separately
  const photos = workTask.photos || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Photos</h3>
        {workTask.status === 'completed' && (
          <Button variant="outline" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Upload Photo
          </Button>
        )}
      </div>
      {photos.length === 0 ? (
        <div className="text-center py-8">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No photos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No photos have been uploaded for this work task yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.key}
              className="relative group cursor-pointer"
              onClick={() => onPhotoClick(photo)}
            >
              <img
                src={photo.thumbnail_url}
                alt="Thumbnail"
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                <p className="text-xs">{formatters.formatDateTime(new Date(photo.taken_at))}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AssetsUsedTab = ({ fleetAssets, isLoading }) => {
  const navigate = useNavigate()

  const handleRowClick = (row) => {
    navigate(`/fleet/${row.original.key}`)
  }

  const columns = [
    {
      accessorKey: 'identifier',
      header: 'Identifier',
      cell: ({ row }) => <code className="font-mono text-sm">{row.original.identifier}</code>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge>{row.original.type}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Assets Used</h3>
      <DataTable
        columns={columns}
        data={fleetAssets}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        emptyState={{
          title: 'No assets used',
          description: 'No fleet assets were used for this work task.',
        }}
      />
    </div>
  )
}

const InvoiceLinkTab = ({ invoice, invoiceLineItem, isLoading }) => {
  const navigate = useNavigate()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!invoice || !invoiceLineItem) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">This work task has not been billed yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Invoice Key
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">
            <button
              onClick={() => navigate(`/invoices/${invoice.key}`)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {invoice.key}
            </button>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Invoice Status
          </label>
          <Badge status={invoice.status}>{invoice.status}</Badge>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Invoice Line Item Key
          </label>
          <p className="text-sm text-gray-900 dark:text-white font-mono">{invoiceLineItem.key}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </label>
          <p className="text-sm text-gray-900 dark:text-white">
            {formatters.formatCurrency(invoiceLineItem.amount || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default WorkTaskDetailPage
