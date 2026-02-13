import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/useTheme'
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
} from '../../utils/validators'
import Button from '../../components/ui/Button'
import ROUTES from '../../constants/routes'

const RegisterPage = () => {
  const { register: registerUser } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      user_name: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  })

  const password = watch('password')

  const validateField = (value, fieldName, validator) => {
    const requiredError = validateRequired(value, fieldName)
    if (requiredError) return requiredError

    if (validator) {
      return validator(value)
    }
    return null
  }

  const validateConfirmPassword = (value) => {
    if (!value) return 'Confirm password is required'
    if (value !== password) return 'Passwords do not match'
    return null
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setFieldErrors({})
    try {
      await registerUser(data)
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors)
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClassName = (hasError) =>
    `block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-text-muted bg-bg-primary text-text-primary focus:outline-none focus:ring-accent focus:border-accent ${
      hasError ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </button>

      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img src="/onevizn.png" alt="OneVizn" className="h-12 mx-auto" />
          <p className="mt-2 text-text-tertiary text-sm">From vision to execution</p>
        </div>

        {/* Register Card */}
        <div className="surface-panel p-8">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-6">
            Create your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="user_name"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Username <span className="text-danger">*</span>
              </label>
              <input
                id="user_name"
                data-testid="register-username"
                type="text"
                {...register('user_name', {
                  validate: (value) => validateField(value, 'Username'),
                })}
                className={inputClassName(errors.user_name)}
                placeholder="Enter your username"
              />
              {(errors.user_name || fieldErrors.user_name) && (
                <p data-testid="register-error-username" className="mt-1 text-sm text-danger">
                  {errors.user_name?.message || fieldErrors.user_name}
                </p>
              )}
            </div>

            {/* First Name Field */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                First Name <span className="text-danger">*</span>
              </label>
              <input
                id="first_name"
                data-testid="register-first-name"
                type="text"
                {...register('first_name', {
                  validate: (value) => validateField(value, 'First name'),
                })}
                className={inputClassName(errors.first_name)}
                placeholder="Enter your first name"
              />
              {(errors.first_name || fieldErrors.first_name) && (
                <p data-testid="register-error-first-name" className="mt-1 text-sm text-danger">
                  {errors.first_name?.message || fieldErrors.first_name}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                id="last_name"
                data-testid="register-last-name"
                type="text"
                {...register('last_name', {
                  validate: (value) => validateField(value, 'Last name'),
                })}
                className={inputClassName(errors.last_name)}
                placeholder="Enter your last name"
              />
              {(errors.last_name || fieldErrors.last_name) && (
                <p data-testid="register-error-last-name" className="mt-1 text-sm text-danger">
                  {errors.last_name?.message || fieldErrors.last_name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                data-testid="register-email"
                type="email"
                {...register('email', {
                  validate: (value) => validateField(value, 'Email', validateEmail),
                })}
                className={inputClassName(errors.email)}
                placeholder="Enter your email"
              />
              {(errors.email || fieldErrors.email) && (
                <p data-testid="register-error-email" className="mt-1 text-sm text-danger">
                  {errors.email?.message || fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                id="phone"
                data-testid="register-phone"
                type="tel"
                {...register('phone', {
                  validate: (value) => validateField(value, 'Phone', validatePhone),
                })}
                className={inputClassName(errors.phone)}
                placeholder="Enter your phone number"
              />
              {(errors.phone || fieldErrors.phone) && (
                <p data-testid="register-error-phone" className="mt-1 text-sm text-danger">
                  {errors.phone?.message || fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  data-testid="register-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    validate: (value) => validateField(value, 'Password', validatePassword),
                  })}
                  className={inputClassName(errors.password).replace('py-2', 'py-2 pr-10')}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {(errors.password || fieldErrors.password) && (
                <p data-testid="register-error-password" className="mt-1 text-sm text-danger">
                  {errors.password?.message || fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  data-testid="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password', {
                    validate: validateConfirmPassword,
                  })}
                  className={inputClassName(errors.confirm_password).replace('py-2', 'py-2 pr-10')}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p
                  data-testid="register-error-confirm-password"
                  className="mt-1 text-sm text-danger"
                >
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* General Error Message */}
            {error && typeof error === 'string' && (
              <div className="text-sm text-danger text-center">{error}</div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              data-testid="register-submit"
              className="w-full"
            >
              Create Account
            </Button>

            {/* Links */}
            <div className="text-center">
              <span className="text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to={ROUTES.LOGIN} className="text-accent hover:text-accent-hover font-medium">
                  <span data-testid="register-login-link">Login</span>
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
