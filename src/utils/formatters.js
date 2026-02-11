import { format, formatDistanceToNow } from 'date-fns'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date) {
  return format(date, 'MMM d, yyyy')
}

export function formatDateTime(date) {
  return format(date, 'MMM d, yyyy h:mm a')
}

export function formatRelativeDate(date) {
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatPhone(phone) {
  // Assume phone is a string of 10 digits
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length !== 10) {
    return phone // Return as is if not 10 digits
  }
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}

export function formatAddress(location) {
  const { address_1, address_2, city, state, zip } = location
  let address = address_1
  if (address_2) {
    address += ` ${address_2}`
  }
  address += `, ${city}, ${state} ${zip}`
  return address
}
