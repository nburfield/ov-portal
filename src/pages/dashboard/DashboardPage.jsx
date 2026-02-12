import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import StatCard from '../../components/charts/StatCard'
import AreaChart from '../../components/charts/AreaChart'
import DonutChart from '../../components/charts/DonutChart'
import DataTable from '../../components/data-table/DataTable'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useApiQuery } from '../../hooks/useApiQuery'
import { invoiceService } from '../../services/invoice.service'
import { workorderService } from '../../services/workorder.service'
import { worktaskService } from '../../services/worktask.service'
import { customerService } from '../../services/customer.service'

const DashboardPage = () => {
  const navigate = useNavigate()

  // Date calculations
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const monthStart = new Date(currentYear, currentMonth, 1)
  const monthEnd = new Date(currentYear, currentMonth + 1, 0)
  const prevMonthStart = new Date(prevYear, prevMonth, 1)
  const prevMonthEnd = new Date(prevYear, prevMonth + 1, 0)

  // Week calculations (Monday to Sunday)
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

  // Data fetching
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
  const revenue = paidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const { data: prevPaidInvoices } = useApiQuery(invoiceService.getAll, {
    status: 'paid',
    period_end__gte: formatDate(prevMonthStart),
    period_end__lte: formatDate(prevMonthEnd),
  })
  const prevRevenue = prevPaidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const revenueTrend = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

  // Revenue AreaChart data
  const yearAgo = new Date(now)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  const { data: revenueDataRaw } = useApiQuery(invoiceService.getAll, {
    status: 'paid',
    period_end__gte: formatDate(yearAgo),
    period_end__lte: formatDate(now),
  })
  const revenueData = useMemo(() => {
    if (!revenueDataRaw) return []
    const monthly = {}
    revenueDataRaw.forEach((inv) => {
      const date = new Date(inv.period_end)
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthly[month] = (monthly[month] || 0) + inv.total
    })
    return Object.entries(monthly).map(([month, rev]) => ({ month, revenue: rev }))
  }, [revenueDataRaw])

  // Task Status DonutChart data
  const { data: tasksThisMonth } = useApiQuery(worktaskService.getAll, {
    completed_at__gte: formatDate(monthStart),
    completed_at__lte: formatDate(monthEnd),
  })
  const taskStatusData = useMemo(() => {
    if (!tasksThisMonth) return []
    const statusCount = {}
    tasksThisMonth.forEach((task) => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1
    })
    const colors = { completed: '#10b981', missed: '#ef4444', cancelled: '#f59e0b' }
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status] || '#6b7280',
    }))
  }, [tasksThisMonth])

  // Upcoming Work Orders
  const { data: upcomingWorkOrders } = useApiQuery(workorderService.getAll, {
    sort: 'next_scheduled_date',
    limit: 10,
  })

  // Overdue Invoices
  const today = formatDate(now)
  const { data: overdueInvoices } = useApiQuery(invoiceService.getAll, {
    status: 'finalized',
    period_end__lt: today,
  })

  // Activity Feed
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
  const activityFeed = useMemo(() => {
    const activities = []
    recentTasks?.forEach((task) =>
      activities.push({
        type: 'task',
        description: `Task completed: ${task.name}`,
        timestamp: task.completed_at,
        icon: ClipboardDocumentCheckIcon,
        color: 'success',
      })
    )
    recentInvoices?.forEach((inv) =>
      activities.push({
        type: 'invoice',
        description: `Invoice ${inv.status}: ${inv.key}`,
        timestamp: inv.updated_at,
        icon: DocumentTextIcon,
        color: 'warning',
      })
    )
    recentCustomers?.forEach((cust) =>
      activities.push({
        type: 'customer',
        description: `New customer: ${cust.name}`,
        timestamp: cust.created_at,
        icon: UserIcon,
        color: 'accent',
      })
    )
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15)
  }, [recentTasks, recentInvoices, recentCustomers])

  const isLoading = loadingActive || loadingTasks || loadingInvoices || loadingRevenue

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Row 1: StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Active Work Orders"
          value={activeCount}
          color="accent"
        />
        <StatCard
          icon={ClipboardDocumentCheckIcon}
          label="Tasks This Week"
          value={taskCount}
          trend={{ isPositive: taskTrend >= 0, value: Math.abs(taskTrend).toFixed(1) }}
          color="success"
        />
        <StatCard
          icon={DocumentTextIcon}
          label="Open Invoices"
          value={openCount}
          trend={{ isPositive: openTrend >= 0, value: Math.abs(openTrend).toFixed(1) }}
          color="warning"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Revenue This Month"
          value={`$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={{ isPositive: revenueTrend >= 0, value: Math.abs(revenueTrend).toFixed(1) }}
          color="success"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AreaChart data={revenueData} title="Revenue Over the Last Year" />
        </div>
        <div>
          <DonutChart
            data={taskStatusData}
            title="Task Status This Month"
            centerLabel={`${tasksThisMonth?.length || 0} Tasks`}
          />
        </div>
      </div>

      {/* Row 3: Upcoming and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Work Orders</h3>
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
              { key: 'assigned_to', label: 'Assigned To' },
              { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
            ]}
            onRowClick={(row) => navigate(`/workorders/${row.key}`)}
          />
          <Button onClick={() => navigate('/workorders')} className="mt-4">
            View all work orders →
          </Button>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Activity Feed</h3>
          <div className="space-y-3">
            {activityFeed.map((activity, i) => (
              <div key={i} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50">
                <activity.icon className={`w-5 h-5 text-${activity.color}-500`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Overdue Invoices */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Overdue Invoices</h3>
        {overdueInvoices?.length ? (
          <DataTable
            data={overdueInvoices}
            columns={[
              { key: 'key', label: 'Invoice Key' },
              { key: 'customer_name', label: 'Customer' },
              { key: 'total', label: 'Total', render: (row) => `$${row.total.toFixed(2)}` },
              {
                key: 'period_end',
                label: 'Period End',
                render: (row) => new Date(row.period_end).toLocaleDateString(),
              },
              {
                key: 'days_overdue',
                label: 'Days Overdue',
                render: (row) =>
                  Math.floor((now - new Date(row.period_end)) / (1000 * 60 * 60 * 24)),
              },
            ]}
            onRowClick={(row) => navigate(`/invoices/${row.key}`)}
          />
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No overdue invoices</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
