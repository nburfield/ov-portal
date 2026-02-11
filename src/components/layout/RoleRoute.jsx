import { useBusiness } from '../../hooks/useBusiness'
import { hasMinRole } from '../../constants/roles'
import Forbidden from './Forbidden'

const RoleRoute = ({ minRole, children }) => {
  const { getCurrentRoles } = useBusiness()

  const currentRoles = getCurrentRoles()

  if (!hasMinRole(currentRoles, minRole)) {
    return <Forbidden />
  }

  return children
}

export default RoleRoute
