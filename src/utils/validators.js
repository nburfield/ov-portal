export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }
  return null
}

export function validatePhone(phone) {
  const phoneRegex = /^\+?\d{10,15}$/
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number'
  }
  return null
}

export function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

export function validateDateRange(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid date format'
  }
  if (endDate <= startDate) {
    return 'End date must be after start date'
  }
  return null
}
