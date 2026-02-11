import React from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '../../utils/cn'

const StatCard = ({ icon, label, value, trend, color }) => {
  const Icon = icon
  const colorClasses = {
    accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
  }

  const trendColorClasses = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
  }

  const TrendIcon = trend?.isPositive ? ChevronUpIcon : ChevronDownIcon

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full',
              colorClasses[color]
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            <TrendIcon
              className={cn(
                'w-4 h-4',
                trendColorClasses[trend.isPositive ? 'positive' : 'negative']
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                trendColorClasses[trend.isPositive ? 'positive' : 'negative']
              )}
            >
              {trend.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
