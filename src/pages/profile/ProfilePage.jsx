import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'
import { useBusiness } from '../../hooks/useBusiness'
import { useToast } from '../../hooks/useToast'
import { userService } from '../../services/user.service'
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators'
import { Button } from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import FormActions from '../../components/forms/FormActions'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const { businesses, roles } = useBusiness()
  const { showToast } = useToast()
  const [showEditModal, setShowEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const validateField = (value, fieldName, validator) => {
    const requiredError = validateRequired(value, fieldName)
    if (requiredError) return requiredError

    if (validator) {
      return validator(value)
    }
    return null
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const updatedUser = await userService.update(user?.key, data)
      updateProfile(updatedUser)
      showToast('Profile updated successfully', 'success')
      setShowEditModal(false)
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div data-testid="profile-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button onClick={() => setShowEditModal(true)} data-testid="profile-edit-button">
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
          <p data-testid="profile-first-name" className="text-sm text-text-primary">
            {user?.first_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
          <p data-testid="profile-last-name" className="text-sm text-text-primary">
            {user?.last_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Username</label>
          <p data-testid="profile-username" className="text-sm text-text-primary font-mono">
            {user?.user_name}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <p data-testid="profile-email" className="text-sm text-text-primary">
            {user?.email}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
          <p data-testid="profile-phone" className="text-sm text-text-primary">
            {user?.phone ? user.phone : 'N/A'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Businesses and Roles</h2>
        <div className="space-y-4">
          {(Array.isArray(businesses) ? businesses : []).map((business) => (
            <div key={business.business_key} className="border rounded-lg p-4">
              <h3 data-testid="profile-businesses" className="font-medium">
                {business.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(roles[business.business_key] || []).map((role) => (
                  <Badge key={role}>{role}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && (
        <Modal isOpen={true} onClose={() => setShowEditModal(false)} title="Edit Profile">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                First Name <span className="text-danger">*</span>
              </label>
              <Input
                id="first_name"
                data-testid="profile-first-name-input"
                {...register('first_name', {
                  validate: (value) => validateField(value, 'First name'),
                })}
                error={errors.first_name?.message}
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Last Name <span className="text-danger">*</span>
              </label>
              <Input
                id="last_name"
                data-testid="profile-last-name-input"
                {...register('last_name', {
                  validate: (value) => validateField(value, 'Last name'),
                })}
                error={errors.last_name?.message}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email <span className="text-danger">*</span>
              </label>
              <Input
                id="email"
                type="email"
                data-testid="profile-email-input"
                {...register('email', {
                  validate: (value) => validateField(value, 'Email', validateEmail),
                })}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                data-testid="profile-phone-input"
                {...register('phone', {
                  validate: (value) => (value ? validatePhone(value) : null),
                })}
                error={errors.phone?.message}
              />
            </div>

            <FormActions
              onSubmit={handleSubmit(onSubmit)}
              onCancel={() => setShowEditModal(false)}
              isSubmitting={isLoading}
            />
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ProfilePage
