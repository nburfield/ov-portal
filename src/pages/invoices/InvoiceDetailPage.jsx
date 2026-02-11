import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'

import { useBusiness } from '../../hooks/useBusiness'
import { getByKey, update } from '../../services/invoice.service'
import {
  getAll as getAllLineItems,
  create as createLineItem,
  update as updateLineItem,
  remove as removeLineItem,
} from '../../services/invoicelineitem.service'
import { getAll as getAllWorkTasks } from '../../services/worktask.service'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { DatePicker } from '../../components/ui/DatePicker'
import { Tabs } from '../../components/ui/Tabs'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Textarea } from '../../components/ui/Textarea'
import { SearchableSelect } from '../../components/ui/SearchableSelect'
import { FormActions } from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { validateRequired } from '../../utils/validators'
import { ArrowLeftIcon, PlusIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline'

const InvoiceDetailPage = () => {
  const { key } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getCurrentRoles } = useBusiness()
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false)
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  const currentRoles = getCurrentRoles()
  const isManagerOrAbove = ['owner', 'manager'].some((role) => currentRoles.includes(role))

  const {
    data: invoice,
    isLoading: invoiceLoading,
    refetch: refetchInvoice,
  } = useApiQuery(() => getByKey(key))

  const {
    data: lineItems = [],
    isLoading: lineItemsLoading,
    refetch: refetchLineItems,
  } = useApiQuery(() => getAllLineItems({ invoice_key: key }), { enabled: !!key })

  // Calculate totals
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [lineItems])

  const total = useMemo(() => {
    return subtotal + (invoice?.tax || 0)
  }, [subtotal, invoice?.tax])

  const handleBack = () => {
    navigate('/invoices')
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(invoice.key)
      showToast('Invoice key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy invoice key', 'error')
    }
  }

  const handleFinalize = async () => {
    try {
      await update(invoice.key, { status: 'finalized' })
      showToast('Invoice finalized successfully', 'success')
      refetchInvoice()
      setShowFinalizeDialog(false)
    } catch {
      showToast('Failed to finalize invoice', 'error')
    }
  }

  const handleMarkPaid = async () => {
    try {
      await update(invoice.key, { status: 'paid' })
      showToast('Invoice marked as paid', 'success')
      refetchInvoice()
      setShowMarkPaidDialog(false)
    } catch {
      showToast('Failed to mark invoice as paid', 'error')
    }
  }

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      showToast('Please provide a reason for voiding', 'error')
      return
    }
    try {
      await update(invoice.key, { status: 'void', void_reason: voidReason })
      showToast('Invoice voided successfully', 'success')
      refetchInvoice()
      setShowVoidDialog(false)
      setVoidReason('')
    } catch {
      showToast('Failed to void invoice', 'error')
    }
  }

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'line-items', label: 'Line Items' },
    { key: 'preview', label: 'Preview' },
  ]

  if (invoiceLoading) {
    return <div>Loading...</div>
  }

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Invoices
          </Button>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Invoice</h1>
            <code
              className="rounded bg-gray-100 px-2 py-1 text-sm cursor-pointer dark:bg-gray-800"
              onClick={handleCopyKey}
            >
              {invoice.key}
            </code>
            <Badge status={invoice.status}>{invoice.status}</Badge>
          </div>
        </div>

        {/* Status Action Buttons */}
        <div className="flex items-center space-x-2">
          {invoice.status === 'draft' && isManagerOrAbove && (
            <Button onClick={() => setShowFinalizeDialog(true)} className="flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Finalize
            </Button>
          )}
          {invoice.status === 'finalized' && isManagerOrAbove && (
            <>
              <Button onClick={() => setShowMarkPaidDialog(true)} variant="outline">
                Mark as Paid
              </Button>
              <Button onClick={() => setShowVoidDialog(true)} variant="outline">
                Void Invoice
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && (
          <DetailsTab
            invoice={invoice}
            isEditable={invoice.status === 'draft' && isManagerOrAbove}
            onUpdate={refetchInvoice}
          />
        )}
        {activeTab === 'line-items' && (
          <LineItemsTab
            invoice={invoice}
            lineItems={lineItems}
            isLoading={lineItemsLoading}
            isEditable={invoice.status === 'draft' && isManagerOrAbove}
            onUpdate={refetchLineItems}
            subtotal={subtotal}
            total={total}
          />
        )}
        {activeTab === 'preview' && (
          <PreviewTab
            invoice={invoice}
            lineItems={lineItems}
            subtotal={subtotal}
            total={total}
            showToast={showToast}
          />
        )}
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showFinalizeDialog}
        onClose={() => setShowFinalizeDialog(false)}
        onConfirm={handleFinalize}
        title="Finalize Invoice"
        description="Are you sure you want to finalize this invoice? It will no longer be editable."
        confirmLabel="Finalize"
      />

      <ConfirmDialog
        isOpen={showMarkPaidDialog}
        onClose={() => setShowMarkPaidDialog(false)}
        onConfirm={handleMarkPaid}
        title="Mark as Paid"
        description="Are you sure you want to mark this invoice as paid?"
        confirmLabel="Mark as Paid"
      />

      <ConfirmDialog
        isOpen={showVoidDialog}
        onClose={() => setShowVoidDialog(false)}
        onConfirm={handleVoid}
        title="Void Invoice"
        description={
          <div className="space-y-4">
            <p>Are you sure you want to void this invoice? This action cannot be undone.</p>
            <Textarea
              label="Reason for voiding"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Please provide a reason..."
              required
            />
          </div>
        }
        confirmLabel="Void Invoice"
        variant="danger"
      />
    </div>
  )
}

const DetailsTab = ({ invoice, isEditable, onUpdate }) => {
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      tax: invoice.tax || 0,
    },
  })

  const periodStart = watch('period_start')

  const validateField = (value, fieldName) => {
    return validateRequired(value, fieldName)
  }

  const validatePeriodEnd = (value) => {
    if (!periodStart || !value) return
    if (new Date(value) <= new Date(periodStart)) {
      return 'Period end must be after period start'
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await update(invoice.key, data)
      showToast('Invoice updated successfully', 'success')
      onUpdate()
      setIsEditing(false)
    } catch {
      showToast('Failed to update invoice', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Invoice Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Invoice Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Key</dt>
              <dd className="text-sm">{invoice.key}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="text-sm">
                <Badge status={invoice.status}>{invoice.status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</dt>
              <dd className="text-sm">{invoice.customer_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="text-sm">{formatters.formatDateTime(new Date(invoice.created_at))}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Billing Period</h3>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <DatePicker
                label="Period Start"
                {...register('period_start', {
                  validate: (value) => validateField(value, 'Period Start'),
                })}
                error={errors.period_start?.message}
                required
              />

              <DatePicker
                label="Period End"
                {...register('period_end', {
                  validate: (value) => {
                    const requiredError = validateField(value, 'Period End')
                    if (requiredError) return requiredError
                    return validatePeriodEnd(value)
                  },
                })}
                error={errors.period_end?.message}
                min={periodStart}
                required
              />

              <div>
                <label
                  htmlFor="tax"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tax
                </label>
                <Input id="tax" type="number" step="0.01" {...register('tax')} placeholder="0.00" />
              </div>

              <FormActions
                onSave={handleSubmit(onSubmit)}
                onCancel={handleCancel}
                loading={isLoading}
              />
            </form>
          ) : (
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Period Start
                </dt>
                <dd className="text-sm">{formatters.formatDate(new Date(invoice.period_start))}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Period End</dt>
                <dd className="text-sm">{formatters.formatDate(new Date(invoice.period_end))}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax</dt>
                <dd className="text-sm">{formatters.formatCurrency(invoice.tax || 0)}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Totals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</dt>
            <dd className="text-2xl font-bold">
              {formatters.formatCurrency(invoice.subtotal || 0)}
            </dd>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax</dt>
            <dd className="text-2xl font-bold">{formatters.formatCurrency(invoice.tax || 0)}</dd>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <dt className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</dt>
            <dd className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatters.formatCurrency(invoice.total || 0)}
            </dd>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      {isEditable && !isEditing && (
        <div className="flex justify-end">
          <Button onClick={() => setIsEditing(true)}>Edit Invoice</Button>
        </div>
      )}
    </div>
  )
}

const LineItemsTab = ({ invoice, lineItems, isEditable, onUpdate, subtotal, total }) => {
  const { showToast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    watch: watchAdd,
    reset: resetAdd,
    setValue: setValueAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    defaultValues: {
      work_task: '',
      description: '',
      price: '',
      quantity: 1.0,
    },
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm()

  const selectedWorkTask = watchAdd('work_task')

  // Load work tasks for the customer that are completed but not yet billed
  const loadWorkTasks = async (searchTerm = '') => {
    try {
      const tasks = await getAllWorkTasks({
        customer_key: invoice.customer_key,
        status: 'completed',
        search: searchTerm,
      })
      // Filter out tasks that are already billed in this invoice
      const billedTaskKeys = new Set(lineItems.map((item) => item.work_task_key))
      const availableTasks = tasks.filter((task) => !billedTaskKeys.has(task.key))
      return availableTasks.map((task) => ({
        value: task.key,
        label: `${task.key} - ${task.service_name}`,
      }))
    } catch {
      return []
    }
  }

  // Auto-fill description and price when work task is selected
  useEffect(() => {
    if (selectedWorkTask) {
      getAllWorkTasks({ key: selectedWorkTask }).then((tasks) => {
        const task = tasks.find((t) => t.key === selectedWorkTask)
        if (task) {
          setValueAdd('description', task.service_name)
          setValueAdd('price', task.price)
        }
      })
    }
  }, [selectedWorkTask, setValueAdd])

  const handleAddLineItem = async (data) => {
    setIsSubmitting(true)
    try {
      await createLineItem({
        invoice_key: invoice.key,
        work_task_key: data.work_task,
        description: data.description,
        price: parseFloat(data.price),
        quantity: parseFloat(data.quantity),
      })
      showToast('Line item added successfully', 'success')
      onUpdate()
      resetAdd()
      setShowAddForm(false)
    } catch {
      showToast('Failed to add line item', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditLineItem = async (data) => {
    setIsSubmitting(true)
    try {
      await updateLineItem(editingItem.key, {
        description: data.description,
        price: parseFloat(data.price),
        quantity: parseFloat(data.quantity),
      })
      showToast('Line item updated successfully', 'success')
      onUpdate()
      setEditingItem(null)
      resetEdit()
    } catch {
      showToast('Failed to update line item', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLineItem = async (itemKey) => {
    try {
      await removeLineItem(itemKey)
      showToast('Line item removed successfully', 'success')
      onUpdate()
    } catch {
      showToast('Failed to remove line item', 'error')
    }
  }

  const startEdit = (item) => {
    setEditingItem(item)
    resetEdit({
      description: item.description,
      price: item.price,
      quantity: item.quantity,
    })
  }

  const cancelEdit = () => {
    setEditingItem(null)
    resetEdit()
  }

  return (
    <div className="space-y-6">
      {/* Add Line Item Button */}
      {isEditable && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Line Items</h3>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Line Item
          </Button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && isEditable && (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-md font-medium mb-4">Add Line Item</h4>
          <form onSubmit={handleSubmitAdd(handleAddLineItem)} className="space-y-4">
            <SearchableSelect
              label="Work Task"
              {...registerAdd('work_task', {
                validate: (value) => validateRequired(value, 'Work Task'),
              })}
              loadOptions={loadWorkTasks}
              error={errorsAdd.work_task?.message}
              placeholder="Search for completed work tasks..."
              required
            />

            <Input
              label="Description"
              {...registerAdd('description', {
                validate: (value) => validateRequired(value, 'Description'),
              })}
              error={errorsAdd.description?.message}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                step="0.01"
                {...registerAdd('price', {
                  validate: (value) => validateRequired(value, 'Price'),
                })}
                error={errorsAdd.price?.message}
                required
              />

              <Input
                label="Quantity"
                type="number"
                step="0.01"
                {...registerAdd('quantity', {
                  validate: (value) => validateRequired(value, 'Quantity'),
                })}
                error={errorsAdd.quantity?.message}
                required
              />
            </div>

            <FormActions
              onSave={handleSubmitAdd(handleAddLineItem)}
              onCancel={() => {
                resetAdd()
                setShowAddForm(false)
              }}
              loading={isSubmitting}
            />
          </form>
        </div>
      )}

      {/* Line Items Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Work Task
              </th>
              {isEditable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {lineItems.map((item) => (
              <tr key={item.key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingItem?.key === item.key ? (
                    <Input
                      {...registerEdit('description', {
                        validate: (value) => validateRequired(value, 'Description'),
                      })}
                      error={errorsEdit.description?.message}
                    />
                  ) : (
                    item.description
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.service_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingItem?.key === item.key ? (
                    <Input
                      type="number"
                      step="0.01"
                      {...registerEdit('price', {
                        validate: (value) => validateRequired(value, 'Price'),
                      })}
                      error={errorsEdit.price?.message}
                    />
                  ) : (
                    formatters.formatCurrency(item.price)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingItem?.key === item.key ? (
                    <Input
                      type="number"
                      step="0.01"
                      {...registerEdit('quantity', {
                        validate: (value) => validateRequired(value, 'Quantity'),
                      })}
                      error={errorsEdit.quantity?.message}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {formatters.formatCurrency(item.price * item.quantity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a
                    href={`/worktasks/${item.work_task_key}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {item.work_task_key}
                  </a>
                </td>
                {isEditable && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingItem?.key === item.key ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSubmitEdit(handleEditLineItem)}
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLineItem(item.key)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t pt-4">
        <div className="flex justify-end space-x-8">
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Subtotal</div>
            <div className="text-lg font-medium">{formatters.formatCurrency(subtotal)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tax</div>
            <div className="text-lg font-medium">{formatters.formatCurrency(invoice.tax || 0)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            <div className="text-xl font-bold">{formatters.formatCurrency(total)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PreviewTab = ({ invoice, lineItems, subtotal, total, showToast }) => {
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    showToast('PDF download not implemented yet', 'info')
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <DocumentTextIcon className="h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
          <EyeIcon className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice Preview */}
      <div className="border rounded-lg p-8 bg-white dark:bg-gray-900 print:shadow-none print:border-none">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Invoice #{invoice.key}</p>
            </div>
            <div className="text-right">
              <Badge status={invoice.status} className="mb-2">
                {invoice.status}
              </Badge>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Date: {formatters.formatDate(new Date())}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">From</h2>
            <div className="text-sm">
              <div className="font-medium">OneVizn</div>
              <div>123 Business St</div>
              <div>City, State 12345</div>
              <div>contact@onevizn.com</div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Bill To</h2>
            <div className="text-sm">
              <div className="font-medium">{invoice.customer_name}</div>
              {/* TODO: Add customer address when available */}
            </div>
          </div>
        </div>

        {/* Billing Period */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Billing Period</h2>
          <div className="text-sm">
            {formatters.formatDate(new Date(invoice.period_start))} -{' '}
            {formatters.formatDate(new Date(invoice.period_end))}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">Description</th>
                <th className="text-right py-2 font-semibold">Price</th>
                <th className="text-right py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.key} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Service: {item.service_name}
                    </div>
                  </td>
                  <td className="text-right py-3">{formatters.formatCurrency(item.price)}</td>
                  <td className="text-right py-3">{item.quantity}</td>
                  <td className="text-right py-3 font-medium">
                    {formatters.formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>{formatters.formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Tax:</span>
              <span>{formatters.formatCurrency(invoice.tax || 0)}</span>
            </div>
            <div className="flex justify-between py-2 border-t font-bold text-lg">
              <span>Total:</span>
              <span>{formatters.formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Thank you for your business!</p>
          <p>Payment is due within 30 days of invoice date.</p>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailPage
