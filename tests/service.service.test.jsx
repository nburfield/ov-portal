import { describe, it, expect, vi } from 'vitest'
import api from '../src/services/api.js'
import { getAll, getByKey, create, update, remove } from '../src/services/service.service.js'

vi.mock('../src/services/api.js')

describe('service.service', () => {
  describe('getAll', () => {
    it('should call api.get with correct endpoint and params', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ id: 1, name: 'Service 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const params = {
        filter: { name: 'test' },
        sort: 'name',
        page: 1,
        page_size: 10,
        search: 'query',
      }
      const result = await getAll(params)

      expect(api.get).toHaveBeenCalledWith('/api/v2/services', { params })
      expect(result).toEqual([{ id: 1, name: 'Service 1' }])
    })
  })

  describe('getByKey', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Service 1' } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getByKey(1)

      expect(api.get).toHaveBeenCalledWith('/api/v2/services/1')
      expect(result).toEqual({ id: 1, name: 'Service 1' })
    })
  })

  describe('create', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'New Service' } }
      api.post.mockResolvedValue(mockResponse)

      const data = { name: 'New Service' }
      const result = await create(data)

      expect(api.post).toHaveBeenCalledWith('/api/v2/services', data)
      expect(result).toEqual({ id: 1, name: 'New Service' })
    })
  })

  describe('update', () => {
    it('should call api.put with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Updated Service' } }
      api.put.mockResolvedValue(mockResponse)

      const data = { name: 'Updated Service' }
      const result = await update(1, data)

      expect(api.put).toHaveBeenCalledWith('/api/v2/services/1', data)
      expect(result).toEqual({ id: 1, name: 'Updated Service' })
    })
  })

  describe('remove', () => {
    it('should call api.delete with correct endpoint', async () => {
      vi.clearAllMocks()
      api.delete.mockResolvedValue()

      await remove(1)

      expect(api.delete).toHaveBeenCalledWith('/api/v2/services/1')
    })
  })
})
