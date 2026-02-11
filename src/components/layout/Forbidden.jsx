import React from 'react'

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Access Forbidden</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  )
}

export default Forbidden
