import { describe, it, expect, vi } from 'vitest'
import api from '../src/services/api.js'
import { getAll, getByKey, create, update, remove } from '../src/services/fleetasset.service.js'

vi.mock('../src/services/api.js')

describe('fleetasset.service', () => {
  describe('getAll', () => {
    it('should call api.get with correct endpoint and params', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ id: 1, name: 'Fleet Asset 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const params = {
        filter: { name: 'test' },
        sort: 'name',
        page: 1,
        page_size: 10,
        search: 'query',
      }
      const result = await getAll(params)

      expect(api.get).toHaveBeenCalledWith('/api/v2/fleetassets', { params })
      expect(result).toEqual([{ id: 1, name: 'Fleet Asset 1' }])
    })
  })

  describe('getByKey', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Fleet Asset 1' } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getByKey(1)

      expect(api.get).toHaveBeenCalledWith('/api/v2/fleetassets/1')
      expect(result).toEqual({ id: 1, name: 'Fleet Asset 1' })
    })
  })

  describe('create', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'New Fleet Asset' } }
      api.post.mockResolvedValue(mockResponse)

      const data = { name: 'New Fleet Asset' }
      const result = await create(data)

      expect(api.post).toHaveBeenCalledWith('/api/v2/fleetassets', data)
      expect(result).toEqual({ id: 1, name: 'New Fleet Asset' })
    })
  })

  describe('update', () => {
    it('should call api.put with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Updated Fleet Asset' } }
      api.put.mockResolvedValue(mockResponse)

      const data = { name: 'Updated Fleet Asset' }
      const result = await update(1, data)

      expect(api.put).toHaveBeenCalledWith('/api/v2/fleetassets/1', data)
      expect(result).toEqual({ id: 1, name: 'Updated Fleet Asset' })
    })
  })

  describe('remove', () => {
    it('should call api.delete with correct endpoint', async () => {
      vi.clearAllMocks()
      api.delete.mockResolvedValue()

      await remove(1)

      expect(api.delete).toHaveBeenCalledWith('/api/v2/fleetassets/1')
    })
  })
})
