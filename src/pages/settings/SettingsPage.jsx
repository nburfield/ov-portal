import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTheme } from '../../contexts/useTheme'
import { useToast } from '../../hooks/useToast'
import { changePassword } from '../../services/auth.service'
import { validatePassword, validateRequired } from '../../utils/validators'
import { Button } from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Toggle from '../../components/ui/Toggle'

const SettingsPage = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const { showToast } = useToast()
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
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

  const onPasswordSubmit = async (data) => {
    if (data.new_password !== data.confirm_new_password) {
      showToast('New passwords do not match', 'error')
      return
    }

    setIsPasswordLoading(true)
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      showToast('Password changed successfully', 'success')
      resetPasswordForm()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Change Password Section */}
      <Card title="Change Password">
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            data-testid="settings-current-password" label="Current Password"
            type="password"
            {...registerPassword('current_password', {
              validate: (value) => validateField(value, 'Current password'),
            })}
            error={passwordErrors.current_password?.message}
            required
          />

          <Input
            data-testid="settings-new-password" label="New Password"
            type="password"
            {...registerPassword('new_password', {
              validate: (value) => validateField(value, 'New password', validatePassword),
            })}
            error={passwordErrors.new_password?.message}
            required
          />

          <Input
            data-testid="settings-confirm-password" label="Confirm New Password"
            type="password"
            {...registerPassword('confirm_new_password', {
              validate: (value) => validateField(value, 'Confirm new password'),
            })}
            error={passwordErrors.confirm_new_password?.message}
            required
          />

          <div className="flex justify-end">
            <Button data-testid="settings-change-password-submit" type="submit" loading={isPasswordLoading}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme Preference Section */}
      <Card title="Theme Preference">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Choose your preferred theme. This setting is automatically saved.
          </p>
          <Toggle
            label={`${theme === 'light' ? 'Light' : 'Dark'} Mode`}
            data-testid="settings-theme-toggle" checked={isDark}
            onChange={toggleTheme}
          />
        </div>
      </Card>

      {/* Notification Preferences Section */}
      <Card title="Notification Preferences">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Configure how you want to receive notifications. (Coming soon)
          </p>
          <div className="space-y-3">
            <Toggle label="Email notifications" checked={false} onChange={() => {}} disabled />
            <Toggle label="Push notifications" checked={false} onChange={() => {}} disabled />
            <Toggle label="SMS notifications" checked={false} onChange={() => {}} disabled />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
