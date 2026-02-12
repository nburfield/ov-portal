import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Briefcase,
  Award,
  UserCircle,
  MapPin,
  ClipboardList,
  CheckSquare,
  Truck,
  FileText,
  ScrollText,
  Network,
  Shield,
  UsersRound,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
} from 'lucide-react'
import { useBusiness } from '../../hooks/useBusiness'
import { hasMinRole } from '../../constants/roles'
import { cn } from '../../utils/cn'

const navigationGroups = [
  {
    name: 'Main',
    items: [
      { icon: HomeIcon, label: 'Dashboard', href: '/dashboard', minRole: 'manager' },
      { icon: Building2, label: 'Business', href: '/business', minRole: 'owner' },
    ],
  },
  {
    name: 'Operations',
    items: [
      { icon: Users, label: 'Users', href: '/users', minRole: 'manager' },
      { icon: ShieldCheck, label: 'Roles', href: '/roles', minRole: 'owner' },
      { icon: Briefcase, label: 'Services', href: '/services', minRole: 'manager' },
      { icon: Award, label: 'Certifications', href: '/certifications', minRole: 'manager' },
    ],
  },
  {
    name: 'Customers',
    items: [
      { icon: UserCircle, label: 'Customers', href: '/customers', minRole: 'manager' },
      { icon: MapPin, label: 'Locations', href: '/locations', minRole: 'manager' },
    ],
  },
  {
    name: 'Work Management',
    items: [
      { icon: ClipboardList, label: 'Work Orders', href: '/workorders', minRole: 'worker' },
      { icon: CheckSquare, label: 'Work Tasks', href: '/worktasks', minRole: 'worker' },
    ],
  },
  {
    name: 'Fleet',
    items: [{ icon: Truck, label: 'Fleet & Assets', href: '/fleet', minRole: 'manager' }],
  },
  {
    name: 'Billing',
    items: [{ icon: FileText, label: 'Invoices', href: '/invoices', minRole: 'manager' }],
  },
  {
    name: 'System',
    items: [
      { icon: ScrollText, label: 'Audit Logs', href: '/audit', minRole: 'owner' },
      { icon: Network, label: 'Subcontractors', href: '/subcontractors', minRole: 'owner' },
    ],
  },
]

const superAdminGroup = {
  name: 'Super Admin',
  items: [
    { icon: Shield, label: 'All Businesses', href: '/admin/businesses', minRole: 'super_admin' },
    { icon: UsersRound, label: 'All Users', href: '/admin/users', minRole: 'super_admin' },
    { icon: Activity, label: 'System Health', href: '/admin/health', minRole: 'super_admin' },
    { icon: Database, label: 'Data Explorer', href: '/admin/data', minRole: 'super_admin' },
  ],
}

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()
  const { getCurrentRoles } = useBusiness()
  const userRoles = getCurrentRoles()
  const [expandedGroups, setExpandedGroups] = useState({})

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const hasSuperAdminAccess = hasMinRole(userRoles, 'super_admin')

  const filteredGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasMinRole(userRoles, item.minRole)),
    }))
    .filter((group) => group.items.length > 0)

  const filteredSuperAdminItems = hasSuperAdminAccess
    ? superAdminGroup.items.filter((item) => hasMinRole(userRoles, item.minRole))
    : []

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  const NavItem = ({ item }) => {
    const active = isActive(item.href)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedGroups[item.label]

    return (
      <div>
        <Link
          to={item.href}
          className={cn('sidebar-item', active && 'sidebar-item-active')}
          title={isCollapsed ? item.label : undefined}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {hasChildren && (
                <ChevronRightIcon
                  className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                />
              )}
            </>
          )}
        </Link>
        {!isCollapsed && hasChildren && isExpanded && (
          <div className="ml-9 mt-1 space-y-0.5">
            {item.children.map((child) => {
              const childActive = isActive(child.href)
              return (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn('sidebar-item py-2 text-sm', childActive && 'sidebar-item-active')}
                >
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const ChevronRightIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-bg-sidebar border-r border-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.name}>
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup(group.name)}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary hover:text-text-primary transition-colors"
              >
                <span className="flex-1 text-left">{group.name}</span>
              </button>
            )}
            <ul className={cn('space-y-0.5', !isCollapsed && 'mt-1')}>
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {filteredSuperAdminItems.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {superAdminGroup.name}
                </p>
              </div>
            )}
            <ul className={cn('space-y-0.5', !isCollapsed && 'mt-1')}>
              {filteredSuperAdminItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn('sidebar-item', active && 'sidebar-item-active')}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={onToggle}
          className="sidebar-item w-full text-text-tertiary hover:text-text-primary"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')}
          />
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
