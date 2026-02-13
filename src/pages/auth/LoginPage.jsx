import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/useTheme'
import Button from '../../components/ui/Button'
import ROUTES from '../../constants/routes'

const LoginPage = () => {
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      user_name: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    try {
      await login(data)
      // Redirect is handled by AuthContext
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Login failed. Please check your credentials.')
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Login Card */}
        <div className="surface-panel p-8">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-6">
            Sign in to your account
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
                id="user_name" data-testid="login-username"
                type="text"
                {...register('user_name', { required: 'Username is required' })}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-text-muted bg-bg-primary text-text-primary focus:outline-none focus:ring-accent focus:border-accent ${
                  errors.user_name
                    ? 'border-danger focus:ring-danger focus:border-danger'
                    : 'border-border'
                }`}
                placeholder="Enter your username"
              />
              {errors.user_name && (
                <p className="mt-1 text-sm text-danger">{errors.user_name.message}</p>
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
                  id="password" data-testid="login-password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-text-muted bg-bg-primary text-text-primary focus:outline-none focus:ring-accent focus:border-accent ${
                    errors.password
                      ? 'border-danger focus:ring-danger focus:border-danger'
                      : 'border-border'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  data-testid="login-password-toggle"
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
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && <div data-testid="login-error" className="text-sm text-danger text-center">{error}</div>}

            {/* Submit Button */}
            <Button type="submit" loading={isLoading} data-testid="login-submit" className="w-full">
              Sign in
            </Button>

            {/* Links */}
            <div className="text-center space-y-2">
              <div>
                <button
                  type="button"
                  className="text-sm text-accent hover:text-accent-hover underline"
                  onClick={() => alert('Forgot password feature coming soon!')}
                >
                  <span data-testid="login-forgot-password">Forgot your password?</span>
                </button>
                <span className="text-text-tertiary ml-2">(Coming soon)</span>
              </div>
              <div>
                <span className="text-sm text-text-secondary">
                  Don't have an account?{' '}
                  <Link to={ROUTES.REGISTER} className="text-accent hover:text-accent-hover font-medium">
                    <span data-testid="login-register-link">Register</span>
                  </Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
