import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div
      data-testid="not-found-page"
      className="min-h-screen bg-bg-tertiary flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 data-testid="not-found-title" className="text-2xl font-semibold text-text-primary mb-2">
          Page Not Found
        </h2>
        <p data-testid="not-found-message" className="text-text-secondary mb-4">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          data-testid="not-found-home-link"
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
