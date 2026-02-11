export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  WORKER: 'worker',
  CUSTOMER: 'customer',
}

export const ROLE_HIERARCHY = ['super_admin', 'owner', 'manager', 'worker', 'customer']

export function hasMinRole(userRoles, minRole) {
  if (!Array.isArray(userRoles) || !minRole) return false
  const minIndex = ROLE_HIERARCHY.indexOf(minRole)
  if (minIndex === -1) return false
  const userHighestIndex = Math.min(
    ...userRoles.map((role) => ROLE_HIERARCHY.indexOf(role)).filter((i) => i !== -1)
  )
  return userHighestIndex <= minIndex
}

export const NAV_PERMISSIONS = {
  '/dashboard': 'manager',
  '/business': 'owner',
  '/users': 'manager',
  '/roles': 'owner',
  '/services': 'manager',
  '/certifications': 'manager',
  '/customers': 'manager',
  '/locations': 'manager',
  '/workorders': 'worker',
  '/worktasks': 'worker',
  '/fleet': 'manager',
  '/invoices': 'manager',
  '/audit': 'owner',
  '/subcontractors': 'owner',
  '/admin/*': 'super_admin',
}
