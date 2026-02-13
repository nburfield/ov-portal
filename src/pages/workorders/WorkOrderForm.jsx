import React, { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useBusiness } from '../../hooks/useBusiness'
import { useToast } from '../../hooks/useToast'
import { create, update, getByKey } from '../../services/workorder.service'
import { getAll as getCustomers } from '../../services/customer.service'
import { getContacts } from '../../services/customer.service'
import { getAll as getLocations } from '../../services/location.service'
import { getAll as getServices } from '../../services/service.service'
import { getSubcontractors } from '../../services/business.service'
import SearchableSelect from '../../components/ui/SearchableSelect'
import DatePicker from '../../components/ui/DatePicker'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import RRuleBuilder from '../../components/forms/RRuleBuilder'
import FormActions from '../../components/forms/FormActions'

const WorkOrderForm = () => {
  const navigate = useNavigate()
  const { key } = useParams()
  const { showToast } = useToast()
  const { activeBusiness } = useBusiness()
  const isEdit = !!key

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerContacts, setCustomerContacts] = useState([])

  // Fetch existing work order data if editing
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useApiQuery(() =>
    isEdit ? getByKey(key) : Promise.resolve(null)
  )

  // Fetch options for dropdowns
  const { data: customers = [] } = useApiQuery(() => getCustomers({ status: 'active' }))
  const { data: services = [] } = useApiQuery(() => getServices({ status: 'active' }))
  const { data: subcontractors = [] } = useApiQuery(() =>
    activeBusiness?.business_key
      ? getSubcontractors(activeBusiness.business_key)
      : Promise.resolve([])
  )

  // Fetch locations filtered by selected customer
  const { data: locations = [] } = useApiQuery(
    () =>
      selectedCustomer ? getLocations({ customer_key: selectedCustomer }) : Promise.resolve([]),
    { enabled: !!selectedCustomer }
  )

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      customer: '',
      location: '',
      service: '',
      price: '',
      assigned_business: activeBusiness?.business_key || '',
      start_date: '',
      end_date: '',
      recurring_schedule: '',
      customer_contact: '',
      status: 'active',
    },
  })

  const watchedCustomer = watch('customer')
  const watchedService = watch('service')

  // Load customer contacts when customer changes
  useEffect(() => {
    const loadCustomerContacts = async () => {
      if (watchedCustomer) {
        try {
          const contacts = await getContacts(watchedCustomer)
          setCustomerContacts(contacts)
        } catch (error) {
          console.error('Error loading customer contacts:', error)
          setCustomerContacts([])
        }
      } else {
        setCustomerContacts([])
      }
    }
    loadCustomerContacts()
  }, [watchedCustomer])

  // Update locations when customer changes
  useEffect(() => {
    setSelectedCustomer(watchedCustomer)
    setValue('location', '') // Reset location when customer changes
  }, [watchedCustomer, setValue])

  // Auto-fill price when service changes
  useEffect(() => {
    if (watchedService && services.length > 0) {
      const selectedService = services.find((s) => s.key === watchedService)
      if (selectedService && selectedService.default_price) {
        setValue('price', selectedService.default_price.toString())
      }
    }
  }, [watchedService, services, setValue])

  // Set form values when work order data is loaded
  useEffect(() => {
    if (workOrder && isEdit) {
      setSelectedCustomer(workOrder.customer_key)
      reset({
        customer: workOrder.customer_key || '',
        location: workOrder.location_key || '',
        service: workOrder.service_key || '',
        price: workOrder.price?.toString() || '',
        assigned_business: workOrder.assigned_business_key || activeBusiness?.business_key || '',
        start_date: workOrder.start_date
          ? new Date(workOrder.start_date).toISOString().split('T')[0]
          : '',
        end_date: workOrder.end_date
          ? new Date(workOrder.end_date).toISOString().split('T')[0]
          : '',
        recurring_schedule: workOrder.recurring_schedule || '',
        customer_contact: workOrder.customer_contact_key || '',
        status: workOrder.status || 'active',
      })
    }
  }, [workOrder, isEdit, reset, activeBusiness?.business_key])

  const businessOptions = useMemo(() => {
    const allBusinesses = [
      { value: activeBusiness?.business_key, label: 'Self' },
      ...subcontractors.map((s) => ({ value: s.business_key, label: s.business_name })),
    ].filter(Boolean)
    return allBusinesses
  }, [activeBusiness, subcontractors])

  const contactOptions = useMemo(
    () => customerContacts.map((c) => ({ value: c.key, label: `${c.first_name} ${c.last_name}` })),
    [customerContacts]
  )

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const payload = {
        customer_key: data.customer,
        location_key: data.location,
        service_key: data.service,
        price: parseFloat(data.price),
        assigned_business_key: data.assigned_business || activeBusiness?.business_key,
        start_date: data.start_date,
        end_date: data.end_date || null,
        recurring_schedule: data.recurring_schedule || null,
        customer_contact_key: data.customer_contact || null,
        status: data.status,
      }

      if (isEdit) {
        await update(key, payload)
        showToast('Work order updated successfully', 'success')
      } else {
        await create(payload)
        showToast('Work order created successfully', 'success')
      }

      navigate('/workorders')
    } catch (error) {
      console.error('Error saving work order:', error)
      showToast(`Failed to ${isEdit ? 'update' : 'create'} work order`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      // Could add unsaved changes warning here
    }
    navigate('/workorders')
  }

  if (isEdit && isLoadingWorkOrder) {
    return <div>Loading...</div>
  }

  return (
    <div data-testid="work-order-form" className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Work Order' : 'Create Work Order'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <Controller
            name="customer"
            control={control}
            rules={{ required: 'Customer is required' }}
            render={({ field }) => (
              <SearchableSelect
                data-testid="wo-customer-select"
                label="Customer"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = customers
                    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                    .map((c) => ({ value: c.key, label: c.name }))
                  return filtered
                }}
                error={errors.customer?.message}
                required
              />
            )}
          />

          {/* Location */}
          <Controller
            name="location"
            control={control}
            rules={{ required: 'Location is required' }}
            render={({ field }) => (
              <SearchableSelect
                data-testid="wo-location-select"
                label="Location"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = locations
                    .filter((l) => l.address.toLowerCase().includes(search.toLowerCase()))
                    .map((l) => ({ value: l.key, label: l.address }))
                  return filtered
                }}
                error={errors.location?.message}
                required
                placeholder={watchedCustomer ? 'Select a location' : 'Select a customer first'}
              />
            )}
          />

          {/* Service */}
          <Controller
            name="service"
            control={control}
            rules={{ required: 'Service is required' }}
            render={({ field }) => (
              <SearchableSelect
                data-testid="wo-service-select"
                label="Service"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = services
                    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
                    .map((s) => ({ value: s.key, label: s.name }))
                  return filtered
                }}
                error={errors.service?.message}
                required
              />
            )}
          />

          {/* Price */}
          <Controller
            name="price"
            control={control}
            rules={{
              required: 'Price is required',
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Price must be a valid number',
              },
              min: {
                value: 0,
                message: 'Price must be positive',
              },
            }}
            render={({ field }) => (
              <Input
                data-testid="wo-price"
                label="Price"
                type="number"
                step="0.01"
                min="0"
                value={field.value}
                onChange={field.onChange}
                error={errors.price?.message}
                required
              />
            )}
          />

          {/* Assigned Business */}
          <Controller
            name="assigned_business"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                data-testid="wo-assigned-business"
                label="Assigned Business"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = businessOptions.filter((b) =>
                    b.label.toLowerCase().includes(search.toLowerCase())
                  )
                  return filtered
                }}
                placeholder="Self"
              />
            )}
          />

          {/* Status */}
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <Select
                data-testid="wo-status"
                label="Status"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
                required
              />
            )}
          />

          {/* Start Date */}
          <Controller
            name="start_date"
            control={control}
            rules={{ required: 'Start date is required' }}
            render={({ field }) => (
              <DatePicker
                data-testid="wo-start-date"
                label="Start Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.start_date?.message}
                required
              />
            )}
          />

          {/* End Date */}
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                data-testid="wo-end-date"
                label="End Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.end_date?.message}
              />
            )}
          />

          {/* Customer Contact */}
          <Controller
            name="customer_contact"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                data-testid="wo-customer-contact"
                label="Customer Contact"
                value={field.value}
                onChange={field.onChange}
                loadOptions={async (search) => {
                  const filtered = contactOptions.filter((c) =>
                    c.label.toLowerCase().includes(search.toLowerCase())
                  )
                  return filtered
                }}
                placeholder={watchedCustomer ? 'Select a contact' : 'Select a customer first'}
              />
            )}
          />
        </div>

        {/* Recurring Schedule */}
        <Controller
          name="recurring_schedule"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Recurring Schedule (Optional)
              </label>
              <div data-testid="wo-rrule-builder">
                <RRuleBuilder value={field.value} onChange={field.onChange} />
              </div>
            </div>
          )}
        />

        <FormActions
          data-testid="wo-submit"
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? 'Update Work Order' : 'Create Work Order'}
        />
      </form>
    </div>
  )
}

export default WorkOrderForm
