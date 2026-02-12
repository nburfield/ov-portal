import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ROUTES from '../../constants/routes'

const LoginPage = () => {
  const { login } = useAuth()
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">OneVizn</h1>
        </div>

        {/* Login Card */}
        <Card>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="user_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="user_name"
                type="text"
                {...register('user_name', { required: 'Username is required' })}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  errors.user_name
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your username"
              />
              {errors.user_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.user_name.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 text-center">{error}</div>
            )}

            {/* Submit Button */}
            <Button type="submit" loading={isLoading} className="w-full">
              Sign in
            </Button>

            {/* Links */}
            <div className="text-center space-y-2">
              <div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  onClick={() => alert('Forgot password feature coming soon!')}
                >
                  Forgot your password?
                </button>
                <span className="text-gray-500 dark:text-gray-400 ml-2">(Coming soon)</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to={ROUTES.REGISTER}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Register
                  </Link>
                </span>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
