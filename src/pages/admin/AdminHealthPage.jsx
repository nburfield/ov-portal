import React, { useEffect, useCallback } from 'react'
import { useApiQuery } from '../../hooks/useApiQuery'
import { healthService } from '../../services/health.service'
import Card from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatters } from '../../utils/formatters'
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CubeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const AdminHealthPage = () => {
  const {
    data: healthData,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useApiQuery(healthService.getHealth)

  const {
    data: queuesData,
    isLoading: queuesLoading,
    refetch: refetchQueues,
  } = useApiQuery(healthService.getQueueDepths)

  const {
    data: errorsData,
    isLoading: errorsLoading,
    refetch: refetchErrors,
  } = useApiQuery(healthService.getRecentErrors)

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useApiQuery(healthService.getStats)

  const handleRefresh = useCallback(() => {
    refetchHealth()
    refetchQueues()
    refetchErrors()
    refetchStats()
  }, [refetchHealth, refetchQueues, refetchErrors, refetchStats])

  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000)
    return () => clearInterval(interval)
  }, [handleRefresh])

  const isHealthy = healthData?.status === 'ok'

  return (
    <div data-testid="admin-health-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CubeIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">System Health</h1>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* API Health */}
      <Card data-testid="admin-health-status" title="API Health" className="w-full">
        {healthLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-danger" />
            )}
            <Badge status={isHealthy ? 'active' : 'error'}>
              {isHealthy ? 'Healthy' : 'Unhealthy'}
            </Badge>
          </div>
        )}
      </Card>

      {/* SQS Queue Depths */}
      <Card title="SQS Queue Depths" className="w-full">
        {queuesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span data-testid="admin-service-status-worktask_updates">worktask_updates:</span>
              <Badge status="active">{queuesData?.worktask_updates || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span data-testid="admin-service-status-invoice_billing">invoice_billing:</span>
              <Badge status="active">{queuesData?.invoice_billing || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span data-testid="admin-service-status-audit_events">audit_events:</span>
              <Badge status="active">{queuesData?.audit_events || 0}</Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Errors */}
      <Card title="Recent Errors" className="w-full">
        {errorsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : errorsData && errorsData.length > 0 ? (
          <div className="space-y-2">
            {errorsData.slice(0, 10).map((error, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-danger-light rounded">
                <ExclamationTriangleIcon className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-danger">{error.message}</p>
                  <p className="text-xs text-danger">
                    {formatters.formatDateTime(error.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">No recent errors</p>
        )}
      </Card>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Businesses */}
        <Card className="text-center">
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-center mb-2">
                <CubeIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold">{statsData?.businesses || 0}</h3>
              <p className="text-sm text-text-tertiary">
                <span data-testid="service-card-businesses">Total Businesses</span>
              </p>
            </>
          )}
        </Card>

        {/* Total Users */}
        <Card className="text-center">
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-center mb-2">
                <UsersIcon className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold">{statsData?.users || 0}</h3>
              <p className="text-sm text-text-tertiary">
                <span data-testid="service-card-users">Total Users</span>
              </p>
            </>
          )}
        </Card>

        {/* Total Work Tasks This Month */}
        <Card className="text-center">
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-center mb-2">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold">{statsData?.workTasksThisMonth || 0}</h3>
              <p className="text-sm text-text-tertiary">
                <span data-testid="service-card-worktasks">Work Tasks This Month</span>
              </p>
            </>
          )}
        </Card>

        {/* Total Invoice Revenue This Month */}
        <Card className="text-center">
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold">
                {formatters.formatCurrency(statsData?.revenueThisMonth || 0)}
              </h3>
              <p className="text-sm text-text-tertiary">
                <span data-testid="service-card-revenue">Revenue This Month</span>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminHealthPage
