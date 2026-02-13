import { Link, useLocation } from 'react-router-dom'
import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Squares2X2Icon,
  BuildingOffice2Icon,
  UsersIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  StarIcon,
  UserCircleIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  BuildingStorefrontIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  ChartBarIcon,
  ServerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth.js'
import { hasMinRole } from '../../constants/roles.js'
import { cn } from '../../utils/cn.js'
import packageJson from '../../../package.json'

const navigationConfig = [
  {
    group: 'Main',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Squares2X2Icon,
        minRole: 'manager',
        testId: 'sidebar-link-dashboard',
      },
      {
        name: 'Business',
        href: '/business',
        icon: BuildingOffice2Icon,
        minRole: 'owner',
        testId: 'sidebar-link-business',
      },
    ],
  },
  {
    group: 'Operations',
    items: [
      {
        name: 'Users',
        href: '/users',
        icon: UsersIcon,
        minRole: 'manager',
        testId: 'sidebar-link-users',
      },
      {
        name: 'Roles',
        href: '/roles',
        icon: ShieldCheckIcon,
        minRole: 'owner',
        testId: 'sidebar-link-roles',
      },
      {
        name: 'Services',
        href: '/services',
        icon: BriefcaseIcon,
        minRole: 'manager',
        testId: 'sidebar-link-services',
      },
      {
        name: 'Certifications',
        href: '/certifications',
        icon: StarIcon,
        minRole: 'manager',
        testId: 'sidebar-link-certifications',
      },
    ],
  },
  {
    group: 'Customers',
    items: [
      {
        name: 'Customers',
        href: '/customers',
        icon: UserCircleIcon,
        minRole: 'manager',
        testId: 'sidebar-link-customers',
      },
      {
        name: 'Locations',
        href: '/locations',
        icon: MapPinIcon,
        minRole: 'manager',
        testId: 'sidebar-link-locations',
      },
    ],
  },
  {
    group: 'Work Management',
    items: [
      {
        name: 'Work Orders',
        href: '/workorders',
        icon: ClipboardDocumentListIcon,
        minRole: 'worker',
        testId: 'sidebar-link-workorders',
      },
      {
        name: 'Work Tasks',
        href: '/worktasks',
        icon: ClipboardDocumentCheckIcon,
        minRole: 'worker',
        testId: 'sidebar-link-worktasks',
      },
    ],
  },
  {
    group: 'Fleet',
    items: [
      {
        name: 'Fleet & Assets',
        href: '/fleet',
        icon: TruckIcon,
        minRole: 'manager',
        testId: 'sidebar-link-fleet',
      },
    ],
  },
  {
    group: 'Billing',
    items: [
      {
        name: 'Invoices',
        href: '/invoices',
        icon: DocumentTextIcon,
        minRole: 'manager',
        testId: 'sidebar-link-invoices',
      },
    ],
  },
  {
    group: 'System',
    items: [
      {
        name: 'Audit Logs',
        href: '/audit',
        icon: DocumentMagnifyingGlassIcon,
        minRole: 'owner',
        testId: 'sidebar-link-audit',
      },
      {
        name: 'Subcontractors',
        href: '/subcontractors',
        icon: BuildingStorefrontIcon,
        minRole: 'owner',
        testId: 'sidebar-link-subcontractors',
      },
    ],
  },
  {
    group: 'Super Admin',
    superAdminOnly: true,
    items: [
      {
        name: 'All Businesses',
        href: '/admin/businesses',
        icon: ShieldExclamationIcon,
        minRole: 'super_admin',
        testId: 'sidebar-link-admin-businesses',
      },
      {
        name: 'All Users',
        href: '/admin/users',
        icon: UserGroupIcon,
        minRole: 'super_admin',
        testId: 'sidebar-link-admin-users',
      },
      {
        name: 'System Health',
        href: '/admin/health',
        icon: ChartBarIcon,
        minRole: 'super_admin',
        testId: 'sidebar-link-admin-health',
      },
      {
        name: 'Data Explorer',
        href: '/admin/data',
        icon: ServerIcon,
        minRole: 'super_admin',
        testId: 'sidebar-link-admin-data',
      },
    ],
  },
]

const Sidebar = ({ isCollapsed, onToggle, isMobile = false, onMobileMenuClose }) => {
  const location = useLocation()
  const { userRoles } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState(new Set(['Main']))

  const userRoleList = useMemo(() => {
    if (!userRoles || !Array.isArray(userRoles)) return []
    return userRoles
  }, [userRoles])

  const filteredNavigation = useMemo(() => {
    return navigationConfig
      .filter((group) => {
        if (group.superAdminOnly && !hasMinRole(userRoleList, 'super_admin')) {
          return false
        }
        const visibleItems = group.items.filter((item) => hasMinRole(userRoleList, item.minRole))
        return visibleItems.length > 0
      })
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasMinRole(userRoleList, item.minRole)),
      }))
  }, [userRoleList])

  const isActiveRoute = useCallback(
    (href) => {
      if (href === '/dashboard') {
        return location.pathname === href
      }
      return location.pathname === href || location.pathname.startsWith(href + '/')
    },
    [location.pathname]
  )

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

  const isGroupExpanded = (groupName) => expandedGroups.has(groupName)

  const isAnyChildActive = useCallback(
    (items) => {
      return items.some((item) => isActiveRoute(item.href))
    },
    [isActiveRoute]
  )

  useEffect(() => {
    filteredNavigation.forEach((group) => {
      if (group.items.some((item) => isActiveRoute(item.href))) {
        setExpandedGroups((prev) => new Set([...prev, group.group]))
      }
    })
  }, [filteredNavigation, isActiveRoute])

  return (
    <div
      data-testid="sidebar"
      className={cn(
        'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-none border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img src="/onevizn.png" alt="OneVizn Logo" className="h-8 object-contain" />
          </div>
        )}
        <button
          onClick={isMobile ? onMobileMenuClose : onToggle}
          data-testid="sidebar-toggle"
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
        >
          {isMobile ? (
            <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((group, groupIndex) => {
          const isExpanded = isGroupExpanded(group.group)
          const hasActiveChild = isAnyChildActive(group.items)
          const showDivider = groupIndex > 0

          const shouldShowItems = isCollapsed || isExpanded || hasActiveChild

          return (
            <div key={group.group}>
              {group.superAdminOnly && showDivider && (
                <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
              )}
              {!group.superAdminOnly && showDivider && !isCollapsed && (
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
              )}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.group)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
                    hasActiveChild
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  <span>{group.group}</span>
                </button>
              )}
              {shouldShowItems && (
                <div className={cn('space-y-0.5', isCollapsed && 'pt-2')}>
                  {group.items.map((item) => {
                    const active = isActiveRoute(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        data-testid={item.testId}
                        onClick={() => {
                          if (isMobile && onMobileMenuClose) {
                            onMobileMenuClose()
                          }
                        }}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150',
                          active
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-l-2 border-primary-600'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon className={cn('w-5 h-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            OneVizn Portal v{packageJson.version}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
