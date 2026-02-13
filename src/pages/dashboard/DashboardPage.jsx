import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BellIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../components/charts/StatCard'
import AreaChart from '../../components/charts/AreaChart'
import DonutChart from '../../components/charts/DonutChart'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Card, { CardBody } from '../../components/ui/Card'
import PageHeader from '../../components/layout/PageHeader'
import { useApiQuery } from '../../hooks/useApiQuery'
import { invoiceService } from '../../services/invoice.service'
import { workorderService } from '../../services/workorder.service'
import { worktaskService } from '../../services/worktask.service'
import { customerService } from '../../services/customer.service'
import ROUTES from '../../constants/routes'

const DashboardPage = () => {
  const navigate = useNavigate()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const monthStart = new Date(currentYear, currentMonth, 1)
  const monthEnd = new Date(currentYear, currentMonth + 1, 0)
  const prevMonthStart = new Date(prevYear, prevMonth, 1)
  const prevMonthEnd = new Date(prevYear, prevMonth + 1, 0)

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }
  const weekStart = getWeekStart(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekEnd = new Date(prevWeekStart)
  prevWeekEnd.setDate(prevWeekEnd.getDate() + 6)

  const formatDate = (date) => date.toISOString().split('T')[0]

  const { data: activeWorkOrders, isLoading: loadingActive } = useApiQuery(
    workorderService.getAll,
    { status: 'active' }
  )
  const activeCount = activeWorkOrders?.length || 0

  const { data: currentTasks, isLoading: loadingTasks } = useApiQuery(worktaskService.getAll, {
    completed_at__gte: formatDate(weekStart),
    completed_at__lte: formatDate(weekEnd),
  })
  const { data: prevTasks } = useApiQuery(worktaskService.getAll, {
    completed_at__gte: formatDate(prevWeekStart),
    completed_at__lte: formatDate(prevWeekEnd),
  })
  const taskCount = currentTasks?.length || 0
  const prevTaskCount = prevTasks?.length || 0
  const taskTrend = prevTaskCount ? ((taskCount - prevTaskCount) / prevTaskCount) * 100 : 0

  const { data: openInvoices, isLoading: loadingInvoices } = useApiQuery(invoiceService.getAll, {
    status__in: 'draft,finalized',
  })
  const { data: prevOpenInvoices } = useApiQuery(invoiceService.getAll, {
    status__in: 'draft,finalized',
    period_end__gte: formatDate(prevMonthStart),
    period_end__lte: formatDate(prevMonthEnd),
  })
  const openCount = openInvoices?.length || 0
  const prevOpenCount = prevOpenInvoices?.length || 0
  const openTrend = prevOpenCount ? ((openCount - prevOpenCount) / prevOpenCount) * 100 : 0

  const { data: paidInvoices, isLoading: loadingRevenue } = useApiQuery(invoiceService.getAll, {
    status: 'paid',
    period_end__gte: formatDate(monthStart),
    period_end__lte: formatDate(monthEnd),
  })
  const revenue = Array.isArray(paidInvoices)
    ? paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    : 0
  const { data: prevPaidInvoices } = useApiQuery(invoiceService.getAll, {
    status: 'paid',
    period_end__gte: formatDate(prevMonthStart),
    period_end__lte: formatDate(prevMonthEnd),
  })
  const prevRevenue = Array.isArray(prevPaidInvoices)
    ? prevPaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    : 0
  const revenueTrend = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  const { data: revenueDataRaw } = useApiQuery(invoiceService.getAll, {
    status: 'paid',
    period_end__gte: formatDate(yearAgo),
    period_end__lte: formatDate(now),
  })
  const revenueData = useMemo(() => {
    if (!Array.isArray(revenueDataRaw)) return []
    const monthly = {}
    revenueDataRaw.forEach((inv) => {
      const date = new Date(inv.period_end)
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthly[month] = (monthly[month] || 0) + inv.total
    })
    return Object.entries(monthly).map(([month, rev]) => ({ month, revenue: rev }))
  }, [revenueDataRaw])

  const { data: tasksThisMonth } = useApiQuery(worktaskService.getAll, {
    completed_at__gte: formatDate(monthStart),
    completed_at__lte: formatDate(monthEnd),
  })
  const taskStatusData = useMemo(() => {
    if (!Array.isArray(tasksThisMonth)) return []
    const statusCount = {}
    tasksThisMonth.forEach((task) => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1
    })
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }))
  }, [tasksThisMonth])

  const { data: upcomingWorkOrders } = useApiQuery(workorderService.getAll, {
    sort: 'next_scheduled_date',
    limit: 10,
  })

  const today = formatDate(now)
  const { data: overdueInvoices } = useApiQuery(invoiceService.getAll, {
    status: 'finalized',
    period_end__lt: today,
  })

  const getArray = (data) =>
    data?.data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
  const { data: recentTasks } = useApiQuery(worktaskService.getAll, {
    sort: '-completed_at',
    limit: 5,
  })
  const { data: recentInvoices } = useApiQuery(invoiceService.getAll, {
    sort: '-updated_at',
    limit: 5,
  })
  const { data: recentCustomers } = useApiQuery(customerService.getAll, {
    sort: '-created_at',
    limit: 5,
  })

  const tasks = getArray(recentTasks)
  const invoices = getArray(recentInvoices)
  const customers = getArray(recentCustomers)

  const activityFeed = useMemo(() => {
    const activities = []
    tasks.forEach((task) =>
      activities.push({
        type: 'task',
        description: `Task completed: ${task.name}`,
        timestamp: task.completed_at,
        icon: ClipboardDocumentCheckIcon,
        color: 'success',
      })
    )
    invoices.forEach((inv) =>
      activities.push({
        type: 'invoice',
        description: `Invoice ${inv.status}: ${inv.key}`,
        timestamp: inv.updated_at,
        icon: DocumentTextIcon,
        color: 'warning',
      })
    )
    customers.forEach((cust) =>
      activities.push({
        type: 'customer',
        description: `New customer: ${cust.name}`,
        timestamp: cust.created_at,
        icon: UserIcon,
        color: 'accent',
      })
    )
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
  }, [tasks, invoices, customers])

  const isLoading = loadingActive || loadingTasks || loadingInvoices || loadingRevenue

  if (isLoading) {
    return (
      <div data-testid="dashboard-loading" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface p-6">
              <div className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-6 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface p-6">
            <div className="skeleton h-64" />
          </div>
          <div className="surface p-6">
            <div className="skeleton h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's what's happening today.`}
        actions={
          <Button variant="primary" onClick={() => navigate(ROUTES.WORK_ORDERS)}>
            New Work Order
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Active Work Orders"
          data-testid="stat-card-active-work-orders"
          value={activeCount}
          color="accent"
        />
        <StatCard
          icon={ClipboardDocumentCheckIcon}
          label="Tasks This Week"
          data-testid="stat-card-tasks-this-week"
          value={taskCount}
          trend={{ isPositive: taskTrend >= 0, value: Math.abs(taskTrend).toFixed(1) }}
          trendLabel="vs last week"
          color="success"
        />
        <StatCard
          icon={DocumentTextIcon}
          label="Open Invoices"
          data-testid="stat-card-open-invoices"
          value={openCount}
          trend={{ isPositive: openTrend >= 0, value: Math.abs(openTrend).toFixed(1) }}
          trendLabel="vs last month"
          color="warning"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Revenue This Month"
          data-testid="stat-card-revenue-this-month"
          value={`$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={{ isPositive: revenueTrend >= 0, value: Math.abs(revenueTrend).toFixed(1) }}
          trendLabel="vs last month"
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="dashboard-revenue-chart" className="lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-primary">Revenue Overview</h3>
              <p className="text-sm text-text-tertiary">Last 12 months</p>
            </div>
          </div>
          <CardBody>
            <AreaChart data={revenueData} title="Revenue" />
          </CardBody>
        </Card>

        <Card data-testid="dashboard-task-chart">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-text-primary">Task Status</h3>
            <p className="text-sm text-text-tertiary">This month</p>
          </div>
          <CardBody>
            <DonutChart
              data={taskStatusData}
              centerLabel={`${tasksThisMonth?.length || 0} Tasks`}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="dashboard-task-chart">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-primary">
                <span data-testid="dashboard-upcoming-workorders">Upcoming Work Orders</span>
              </h3>
              <p className="text-sm text-text-tertiary">Next scheduled work orders</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.WORK_ORDERS)}>
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CardBody className="p-0">
            <DataTable
              data={upcomingWorkOrders || []}
              columns={[
                { key: 'customer_name', label: 'Customer' },
                { key: 'service_name', label: 'Service' },
                {
                  key: 'next_scheduled_date',
                  label: 'Next Date',
                  render: (row) => new Date(row.next_scheduled_date).toLocaleDateString(),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (row) => <Badge>{row.status}</Badge>,
                },
              ]}
              onRowClick={(row) => navigate(`/workorders/${row.key}`)}
              variant="plain"
              enableSelection={false}
            />
          </CardBody>
        </Card>

        <Card data-testid="dashboard-task-chart">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-primary">
                <span data-testid="dashboard-activity-feed">Recent Activity</span>
              </h3>
              <p className="text-sm text-text-tertiary">Latest updates from your system</p>
            </div>
          </div>
          <CardBody>
            <div className="space-y-4">
              {activityFeed.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg bg-${activity.color}-light dark:bg-${activity.color}-muted`}
                  >
                    <activity.icon className={`h-4 w-4 text-${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ClockIcon className="h-3 w-3 text-text-muted" />
                      <p className="text-xs text-text-tertiary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {activityFeed.length === 0 && (
                <div className="text-center py-8 text-text-tertiary">No recent activity</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {overdueInvoices?.length > 0 && (
        <Card variant="elevated" className="border-warning/50">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-warning-light/30 dark:bg-warning-muted/20">
            <BellIcon className="h-5 w-5 text-warning" />
            <div>
              <h3 className="font-semibold text-warning">
                <span data-testid="dashboard-overdue-alert">Attention Required</span>
              </h3>
              <p className="text-sm text-text-secondary">
                You have {overdueInvoices.length} overdue invoices
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={() => navigate(ROUTES.INVOICES)}
            >
              View Invoices
            </Button>
          </div>
          <CardBody className="p-0">
            <DataTable
              data={overdueInvoices}
              columns={[
                { key: 'key', label: 'Invoice Key' },
                { key: 'customer_name', label: 'Customer' },
                {
                  key: 'total',
                  label: 'Total',
                  render: (row) => `$${row.total.toFixed(2)}`,
                },
                {
                  key: 'period_end',
                  label: 'Due Date',
                  render: (row) => new Date(row.period_end).toLocaleDateString(),
                },
                {
                  key: 'days_overdue',
                  label: 'Days Overdue',
                  render: (row) => (
                    <Badge variant="danger">
                      {Math.floor((now - new Date(row.period_end)) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  ),
                },
              ]}
              onRowClick={(row) => navigate(`/invoices/${row.key}`)}
              variant="plain"
              enableSelection={false}
            />
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
