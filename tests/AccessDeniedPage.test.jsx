import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AccessDeniedPage from '../src/pages/errors/AccessDeniedPage'

describe('AccessDeniedPage', () => {
  it('renders 403 page with access denied message', () => {
    render(<AccessDeniedPage />)

    expect(screen.getByText('403')).toBeInTheDocument()
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(
      screen.getByText('You do not have sufficient permissions to access this page.')
    ).toBeInTheDocument()
  })
})
