import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import FormField from '../src/components/forms/FormField'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Test Label">
        <input />
      </FormField>
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders required asterisk', () => {
    render(
      <FormField label="Test Label" required>
        <input />
      </FormField>
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <FormField label="Test">
        <input data-testid="input" />
      </FormField>
    )
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('renders error with aria-live', () => {
    render(
      <FormField label="Test" error="Error message">
        <input />
      </FormField>
    )
    const errorElement = screen.getByText('Error message')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveAttribute('aria-live', 'polite')
  })

  it('sets htmlFor on label', () => {
    render(
      <FormField label="Test" htmlFor="test-id">
        <input id="test-id" />
      </FormField>
    )
    const label = screen.getByText('Test')
    expect(label).toHaveAttribute('for', 'test-id')
  })
})
