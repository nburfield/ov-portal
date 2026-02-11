import { describe, it, expect, vi } from 'vitest'
import api from '../src/services/api.js'
import {
  getHealth,
  getQueueDepths,
  getRecentErrors,
  getStats,
} from '../src/services/health.service.js'

vi.mock('../src/services/api.js')

describe('health.service', () => {
  describe('getHealth', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { status: 'ok' } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getHealth()

      expect(api.get).toHaveBeenCalledWith('/api/v1/health')
      expect(result).toEqual({ status: 'ok' })
    })
  })

  describe('getQueueDepths', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { worktask_updates: 5, invoice_billing: 0, audit_events: 2 } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getQueueDepths()

      expect(api.get).toHaveBeenCalledWith('/api/v1/health/queues')
      expect(result).toEqual({ worktask_updates: 5, invoice_billing: 0, audit_events: 2 })
    })
  })

  describe('getRecentErrors', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ timestamp: '2023-01-01T00:00:00Z', message: 'Error 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const result = await getRecentErrors()

      expect(api.get).toHaveBeenCalledWith('/api/v1/health/errors')
      expect(result).toEqual([{ timestamp: '2023-01-01T00:00:00Z', message: 'Error 1' }])
    })
  })

  describe('getStats', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = {
        data: { businesses: 100, users: 500, workTasksThisMonth: 200, revenueThisMonth: 15000 },
      }
      api.get.mockResolvedValue(mockResponse)

      const result = await getStats()

      expect(api.get).toHaveBeenCalledWith('/api/v1/health/stats')
      expect(result).toEqual({
        businesses: 100,
        users: 500,
        workTasksThisMonth: 200,
        revenueThisMonth: 15000,
      })
    })
  })
})
