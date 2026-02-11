import { describe, it, expect, vi } from 'vitest'
import api from '../src/services/api.js'
import {
  getAll,
  getByKey,
  create,
  update,
  remove,
  getContacts,
  createContact,
  getContracts,
  createContract,
  uploadContract,
  getContractUrl,
} from '../src/services/customer.service.js'

vi.mock('../src/services/api.js')

describe('customer.service', () => {
  describe('getAll', () => {
    it('should call api.get with correct endpoint and params', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ id: 1, name: 'Customer 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const params = {
        filter: { name: 'test' },
        sort: 'name',
        page: 1,
        page_size: 10,
        search: 'query',
      }
      const result = await getAll(params)

      expect(api.get).toHaveBeenCalledWith('/api/v2/customers', { params })
      expect(result).toEqual([{ id: 1, name: 'Customer 1' }])
    })
  })

  describe('getByKey', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Customer 1' } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getByKey(1)

      expect(api.get).toHaveBeenCalledWith('/api/v2/customers/1')
      expect(result).toEqual({ id: 1, name: 'Customer 1' })
    })
  })

  describe('create', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'New Customer' } }
      api.post.mockResolvedValue(mockResponse)

      const data = { name: 'New Customer' }
      const result = await create(data)

      expect(api.post).toHaveBeenCalledWith('/api/v2/customers', data)
      expect(result).toEqual({ id: 1, name: 'New Customer' })
    })
  })

  describe('update', () => {
    it('should call api.put with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'Updated Customer' } }
      api.put.mockResolvedValue(mockResponse)

      const data = { name: 'Updated Customer' }
      const result = await update(1, data)

      expect(api.put).toHaveBeenCalledWith('/api/v2/customers/1', data)
      expect(result).toEqual({ id: 1, name: 'Updated Customer' })
    })
  })

  describe('remove', () => {
    it('should call api.delete with correct endpoint', async () => {
      vi.clearAllMocks()
      api.delete.mockResolvedValue()

      await remove(1)

      expect(api.delete).toHaveBeenCalledWith('/api/v2/customers/1')
    })
  })

  describe('getContacts', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ id: 1, name: 'Contact 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const result = await getContacts(1)

      expect(api.get).toHaveBeenCalledWith('/api/v2/customers/1/contacts')
      expect(result).toEqual([{ id: 1, name: 'Contact 1' }])
    })
  })

  describe('createContact', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, name: 'New Contact' } }
      api.post.mockResolvedValue(mockResponse)

      const data = { name: 'New Contact' }
      const result = await createContact(1, data)

      expect(api.post).toHaveBeenCalledWith('/api/v2/customers/1/contacts', data)
      expect(result).toEqual({ id: 1, name: 'New Contact' })
    })
  })

  describe('getContracts', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: [{ id: 1, file_name: 'Contract 1' }] }
      api.get.mockResolvedValue(mockResponse)

      const result = await getContracts(1)

      expect(api.get).toHaveBeenCalledWith('/api/v2/customers/1/contracts')
      expect(result).toEqual([{ id: 1, file_name: 'Contract 1' }])
    })
  })

  describe('createContract', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { id: 1, file_name: 'New Contract' } }
      api.post.mockResolvedValue(mockResponse)

      const data = { file_name: 'New Contract' }
      const result = await createContract(1, data)

      expect(api.post).toHaveBeenCalledWith('/api/v2/customers/1/contracts', data)
      expect(result).toEqual({ id: 1, file_name: 'New Contract' })
    })
  })

  describe('uploadContract', () => {
    it('should call api.get for upload url and fetch to upload file', async () => {
      vi.clearAllMocks()
      global.fetch = vi.fn()
      const mockResponse = { data: { put_url: 'https://s3.url' } }
      api.get.mockResolvedValue(mockResponse)
      fetch.mockResolvedValue()

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      await uploadContract(1, 'contract-key', file)

      expect(api.get).toHaveBeenCalledWith('/api/v2/customers/1/contracts/contract-key/upload')
      expect(fetch).toHaveBeenCalledWith('https://s3.url', {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/pdf',
        },
      })
    })
  })

  describe('getContractUrl', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { get_url: 'https://s3.url/contract.pdf' } }
      api.get.mockResolvedValue(mockResponse)

      const result = await getContractUrl(1, 'contract-key')

      expect(api.get).toHaveBeenCalledWith('/api/v2/customers/1/contracts/contract-key/url')
      expect(result).toEqual('https://s3.url/contract.pdf')
    })
  })
})
