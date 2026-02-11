import React from 'react'
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
} from 'lucide-react'
import { useBusiness } from '../../hooks/useBusiness'
import { hasMinRole } from '../../constants/roles'

const navigationGroups = [
  {
    name: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', minRole: 'manager' },
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

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 p-4">
        <nav className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.name}>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.name}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {filteredSuperAdminItems.length > 0 && (
            <div>
              {!isCollapsed && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {superAdminGroup.name}
                  </h3>
                </>
              )}
              <ul className="space-y-1">
                {filteredSuperAdminItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          active
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* Collapse toggle at bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-full p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
