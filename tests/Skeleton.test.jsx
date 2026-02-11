import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import Skeleton from '../src/components/ui/Skeleton'

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe('Skeleton', () => {
  it('renders single text skeleton by default', () => {
    render(<Skeleton />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass(
      'animate-pulse',
      'bg-gray-200',
      'dark:bg-gray-700',
      'h-4',
      'rounded'
    )
  })

  it('renders multiple skeletons when count > 1', () => {
    render(<Skeleton count={3} />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(3)
  })

  it('applies circle variant', () => {
    render(<Skeleton variant="circle" />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('rounded-full')
  })

  it('applies rect variant', () => {
    render(<Skeleton variant="rect" />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('rounded')
  })

  it('applies custom width and height', () => {
    render(<Skeleton width="100px" height="50px" />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' })
  })

  it('renders SkeletonRow variant', () => {
    render(<Skeleton variant="SkeletonRow" />)
    const row = document.querySelector('.flex.items-center.space-x-4')
    expect(row).toBeInTheDocument()
    expect(row).toHaveClass('animate-pulse')
  })

  it('renders multiple SkeletonRow variants', () => {
    render(<Skeleton variant="SkeletonRow" count={2} />)
    const rows = document.querySelectorAll('.flex.items-center.space-x-4')
    expect(rows).toHaveLength(2)
  })
})
