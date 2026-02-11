import React, { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useBusiness } from '../../hooks/useBusiness'
import { useToast } from '../../hooks/useToast'
import { create } from '../../services/worktask.service'
import { getAll as getWorkOrders } from '../../services/workorder.service'
import { getAll as getUsers } from '../../services/user.service'
import { getAll as getUserServices } from '../../services/userservice.service'
import { getAll as getFleetAssets } from '../../services/fleetasset.service'
import SearchableSelect from '../../components/ui/SearchableSelect'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import FormActions from '../../components/forms/FormActions'

const WorkTaskForm = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { activeBusiness } = useBusiness()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null)

  // Fetch options
  const { data: workOrders = [] } = useApiQuery(() =>
    getWorkOrders({ status: 'active', assigned_business_key: activeBusiness?.business_key })
  )
  const { data: users = [] } = useApiQuery(() => getUsers())
  const { data: userServices = [] } = useApiQuery(() => getUserServices())
  const { data: fleetAssets = [] } = useApiQuery(() =>
    getFleetAssets({ business_key: activeBusiness?.business_key, status: 'active' })
  )

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      work_order: '',
      worker: '',
      performed_at: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
      status: 'completed',
      reason: '',
      assets_used: [],
    },
  })

  const watchedWorkOrder = watch('work_order')
  const watchedStatus = watch('status')

  // Update selected work order
  useEffect(() => {
    if (watchedWorkOrder) {
      const workOrder = workOrders.find((wo) => wo.key === watchedWorkOrder)
      setSelectedWorkOrder(workOrder)
    } else {
      setSelectedWorkOrder(null)
    }
  }, [watchedWorkOrder, workOrders])

  // Filter workers by certifications for the selected work order
  const availableWorkers = useMemo(() => {
    if (!selectedWorkOrder) return []

    const requiredService = selectedWorkOrder.service_key
    const certifiedUserKeys = userServices
      .filter((us) => us.service_key === requiredService && us.certified)
      .map((us) => us.user_key)

    return users.filter((user) => certifiedUserKeys.includes(user.key))
  }, [selectedWorkOrder, userServices, users])

  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'missed', label: 'Missed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const onSubmit = async (data) => {
    if (!selectedWorkOrder) return

    setIsSubmitting(true)
    try {
      const payload = {
        work_order_key: data.work_order,
        worker_key: data.worker,
        performed_at: data.performed_at,
        status: data.status,
        reason: data.status !== 'completed' ? data.reason : null,
        assets_used: data.assets_used,
        service_snapshot: {
          key: selectedWorkOrder.service_key,
          name: selectedWorkOrder.service_name,
        },
        price_snapshot: selectedWorkOrder.price,
      }

      await create(payload)
      showToast('Work task logged successfully', 'success')
      navigate('/worktasks')
    } catch (error) {
      console.error('Error creating work task:', error)
      showToast('Failed to log work task', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      // Could add unsaved changes warning here
    }
    navigate('/worktasks')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Log Work Task</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Order */}
          <Controller
            name="work_order"
            control={control}
            rules={{ required: 'Work order is required' }}
            render={({ field }) => (
              <SearchableSelect
                label="Work Order"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = workOrders
                    .filter((wo) => wo.key.toLowerCase().includes(search.toLowerCase()))
                    .map((wo) => ({ value: wo.key, label: `${wo.key} - ${wo.service_name}` }))
                  return filtered
                }}
                error={errors.work_order?.message}
                required
              />
            )}
          />

          {/* Worker */}
          <Controller
            name="worker"
            control={control}
            rules={{ required: 'Worker is required' }}
            render={({ field }) => (
              <SearchableSelect
                label="Worker"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = availableWorkers
                    .filter((user) =>
                      `${user.first_name} ${user.last_name}`
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((user) => ({
                      value: user.key,
                      label: `${user.first_name} ${user.last_name}`,
                    }))
                  return filtered
                }}
                error={errors.worker?.message}
                required
                placeholder={
                  selectedWorkOrder ? 'Select a certified worker' : 'Select a work order first'
                }
              />
            )}
          />

          {/* Performed At */}
          <Controller
            name="performed_at"
            control={control}
            rules={{ required: 'Performed at is required' }}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Performed At <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                />
                {errors.performed_at && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.performed_at.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Status */}
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <Select
                label="Status"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
                required
              />
            )}
          />

          {/* Assets Used */}
          <Controller
            name="assets_used"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Assets Used"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = fleetAssets
                    .filter((asset) => asset.name.toLowerCase().includes(search.toLowerCase()))
                    .map((asset) => ({ value: asset.key, label: asset.name }))
                  return filtered
                }}
                multiple
                placeholder="Select assets used"
              />
            )}
          />
        </div>

        {/* Reason */}
        {(watchedStatus === 'missed' || watchedStatus === 'cancelled') && (
          <Controller
            name="reason"
            control={control}
            rules={{ required: 'Reason is required when status is missed or cancelled' }}
            render={({ field }) => (
              <Textarea
                label="Reason"
                value={field.value}
                onChange={field.onChange}
                error={errors.reason?.message}
                required
                placeholder="Please explain why this task was missed or cancelled"
              />
            )}
          />
        )}

        {/* Read-only snapshots */}
        {selectedWorkOrder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {selectedWorkOrder.service_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                ${selectedWorkOrder.price}
              </p>
            </div>
          </div>
        )}

        <FormActions
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel="Log Work Task"
        />
      </form>
    </div>
  )
}

export default WorkTaskForm
