import { useAuth } from '../../hooks/useAuth'
import { hasMinRole } from '../../constants/roles'
import Forbidden from './Forbidden'

const AdminRoute = ({ children }) => {
  const { userRoles } = useAuth()

  if (!hasMinRole(userRoles, 'super_admin')) {
    return <Forbidden />
  }

  return children
}

export default AdminRoute
