import { STATUS_COLORS } from '../../constants/statuses.js'

function Badge({ status, children }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.active
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
      {children}
    </span>
  )
}

export { Badge }
export default Badge
