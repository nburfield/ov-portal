import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from '../src/pages/errors/NotFoundPage'

describe('NotFoundPage', () => {
  it('renders 404 page with link to dashboard', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByText("The page you're looking for doesn't exist.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument()
  })
})
