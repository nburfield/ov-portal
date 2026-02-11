function Avatar({ firstName, lastName, size = 'md' }) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
  const hash = (firstName + lastName).split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 10
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-gray-500',
  ]
  const bgColor = colors[hash]
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${bgColor} ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  )
}

export default Avatar
