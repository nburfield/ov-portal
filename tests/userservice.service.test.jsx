import { describe, it, expect, vi } from 'vitest'
import api from '../src/services/api.js'
import { getAll, getByKey, create, update, remove } from '../src/services/userservice.service.js'

vi.mock('../src/services/api.js')

describe('userservice.service', () => {
  describe('getAll', () => {
    it('should call api.get with correct endpoint and params', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ id: 1, name: 'UserService 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const params = {
        filter: { name: 'test' },
        sort: 'name',
        page: 1,
        page_size: 10,
        search: 'query',
      }
      const result = await getAll(params)

      expect(api.get).toHaveBeenCalledWith('/api/v2/userservices', { params })
      expect(result).toEqual([{ id: 1, name: 'UserService 1' }])
    })
  })

  describe('getByKey', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'UserService 1' } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getByKey(1)

      expect(api.get).toHaveBeenCalledWith('/api/v2/userservices/1')
      expect(result).toEqual({ id: 1, name: 'UserService 1' })
    })
  })

  describe('create', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'New UserService' } }
      api.post.mockResolvedValue(mockResponse)

      const data = { name: 'New UserService' }
      const result = await create(data)

      expect(api.post).toHaveBeenCalledWith('/api/v2/userservices', data)
      expect(result).toEqual({ id: 1, name: 'New UserService' })
    })
  })

  describe('update', () => {
    it('should call api.put with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Updated UserService' } }
      api.put.mockResolvedValue(mockResponse)

      const data = { name: 'Updated UserService' }
      const result = await update(1, data)

      expect(api.put).toHaveBeenCalledWith('/api/v2/userservices/1', data)
      expect(result).toEqual({ id: 1, name: 'Updated UserService' })
    })
  })

  describe('remove', () => {
    it('should call api.delete with correct endpoint', async () => {
      vi.clearAllMocks()
      api.delete.mockResolvedValue()

      await remove(1)

      expect(api.delete).toHaveBeenCalledWith('/api/v2/userservices/1')
    })
  })
})
