import React from 'react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Page Not Found</h2>
        <p className="text-text-secondary">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  )
}

export default NotFound
