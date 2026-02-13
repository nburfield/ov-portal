import React from 'react'

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">Access Forbidden</h2>
        <p className="text-text-secondary">You don't have permission to access this page.</p>
      </div>
    </div>
  )
}

export default Forbidden
