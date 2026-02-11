import { describe, it, expect, vi } from 'vitest'
import api from '../src/services/api.js'
import { login, register, refresh, logout } from '../src/services/auth.service.js'

vi.mock('../src/services/api.js')

describe('auth.service', () => {
  describe('login', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { token: 'mock-token' } }
      api.post.mockResolvedValue(mockResponse)

      const result = await login({ user_name: 'testuser', password: 'testpass' })

      expect(api.post).toHaveBeenCalledWith('/api/v2/auth/login', {
        user_name: 'testuser',
        password: 'testpass',
      })
      expect(result).toEqual({ token: 'mock-token' })
    })
  })

  describe('register', () => {
    it('should call api.post with correct endpoint and data', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { user: 'mock-user' } }
      api.post.mockResolvedValue(mockResponse)

      const result = await register({
        user_name: 'testuser',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '123-456-7890',
      })

      expect(api.post).toHaveBeenCalledWith('/api/v2/auth/register', {
        user_name: 'testuser',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '123-456-7890',
      })
      expect(result).toEqual({ user: 'mock-user' })
    })
  })

  describe('refresh', () => {
    it('should call api.post with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { token: 'new-token' } }
      api.post.mockResolvedValue(mockResponse)

      const result = await refresh()

      expect(api.post).toHaveBeenCalledWith('/api/v2/auth/refresh')
      expect(result).toEqual({ token: 'new-token' })
    })
  })

  describe('logout', () => {
    it('should call api.post with correct endpoint', async () => {
      vi.clearAllMocks()
      const mockResponse = { data: { success: true } }
      api.post.mockResolvedValue(mockResponse)

      const result = await logout()

      expect(api.post).toHaveBeenCalledWith('/api/v2/auth/logout')
      expect(result).toEqual({ success: true })
    })
  })
})
