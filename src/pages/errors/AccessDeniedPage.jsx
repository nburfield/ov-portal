import React from 'react'

const AccessDeniedPage = () => {
  return (
    <div
      data-testid="access-denied-page"
      className="min-h-screen bg-bg-tertiary flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">403</h1>
        <h2
          data-testid="access-denied-title"
          className="text-2xl font-semibold text-text-primary mb-2"
        >
          Access Denied
        </h2>
        <p data-testid="access-denied-message" className="text-text-secondary">
          You do not have sufficient permissions to access this page.
        </p>
      </div>
    </div>
  )
}

export default AccessDeniedPage
