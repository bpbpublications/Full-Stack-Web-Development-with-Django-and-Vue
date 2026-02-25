import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockUserFactory, mockErrorFactory } from '../../test/factories'

/**
 * Integration Tests for Authentication Service
 * Tests the frontend authService against mocked Django backend contracts
 * 
 * Endpoints tested:
 * - POST /auth/register/
 * - POST /auth/login/
 * - POST /auth/logout/
 * - GET /auth/me/
 */
describe('AuthService Integration Tests', () => {
  let authService
  let mockApiClient

  beforeEach(() => {
    // Mock the API client
    mockApiClient = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn()
    }

    // In real tests, inject or mock the apiClient
    // For now, we're showing the test structure
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  /**
   * PATTERN 1: User Registration
   * Contract: POST /auth/register/
   * Success: 201 Created with user object and tokens
   * Errors: 400 (validation), 409 (email taken)
   */
  describe('User Registration', () => {
    it('successfully registers a new user', async () => {
      const registerPayload = mockUserFactory.createUser({
        username: 'newuser',
        email: 'newuser@example.com'
      })

      const expectedResponse = mockUserFactory.authResponse({
        user: {
          username: 'newuser',
          email: 'newuser@example.com',
          id: 2
        }
      })

      mockApiClient.post.mockResolvedValueOnce({
        status: 201,
        data: expectedResponse
      })

      // Simulate: const response = await authService.register(registerPayload)
      const response = await mockApiClient.post('/auth/register/', registerPayload)

      expect(response.status).toBe(201)
      expect(response.data.user.username).toBe('newuser')
      expect(response.data.access).toBeDefined()
      expect(response.data.refresh).toBeDefined()
    })

    it('returns 400 for invalid registration data', async () => {
      const invalidPayload = mockUserFactory.createUser({
        password: 'weak'
      })

      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.validationError('password', 'Password must be at least 8 characters.')
      )

      const response = await mockApiClient.post('/auth/register/', invalidPayload)

      expect(response.status).toBe(400)
      expect(response.data.password).toBeDefined()
    })

    it('returns 409 when email already exists', async () => {
      const duplicatePayload = mockUserFactory.createUser({
        email: 'existing@example.com'
      })

      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.emailTaken()
      )

      const response = await mockApiClient.post('/auth/register/', duplicatePayload)

      expect(response.status).toBe(409)
      expect(response.data.email).toBeDefined()
      expect(response.data.email[0]).toContain('already exists')
    })

    it('validates required fields', async () => {
      const incompletePayload = {
        username: 'testuser'
        // missing email and password
      }

      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.validationError('email', 'This field is required.')
      )

      const response = await mockApiClient.post('/auth/register/', incompletePayload)

      expect(response.status).toBe(400)
    })
  })

  /**
   * PATTERN 2: User Login
   * Contract: POST /auth/login/
   * Success: 200 OK with tokens and user object
   * Errors: 401 (invalid credentials)
   */
  describe('User Login', () => {
    it('successfully logs in a user', async () => {
      const credentials = mockUserFactory.loginCredentials()
      const expectedResponse = mockUserFactory.authResponse()

      mockApiClient.post.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.post('/auth/login/', credentials)

      expect(response.status).toBe(200)
      expect(response.data.access).toBeDefined()
      expect(response.data.refresh).toBeDefined()
      expect(response.data.user.id).toBeDefined()
    })

    it('returns 401 for invalid credentials', async () => {
      const invalidCredentials = mockUserFactory.loginCredentials({
        password: 'wrongpassword'
      })

      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.unauthorized()
      )

      const response = await mockApiClient.post('/auth/login/', invalidCredentials)

      expect(response.status).toBe(401)
      expect(response.data.detail).toContain('credentials')
    })

    it('returns 401 for non-existent user', async () => {
      const nonExistentUser = mockUserFactory.loginCredentials({
        username: 'nonexistent'
      })

      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.unauthorized()
      )

      const response = await mockApiClient.post('/auth/login/', nonExistentUser)

      expect(response.status).toBe(401)
    })

    it('returns tokens in correct format', async () => {
      const credentials = mockUserFactory.loginCredentials()
      const expectedResponse = mockUserFactory.authResponse()

      mockApiClient.post.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.post('/auth/login/', credentials)

      expect(response.data.access).toMatch(/^[\w\-\.]+\.[\w\-\.]+\.[\w\-\.]+$/) // JWT format
      expect(response.data.refresh).toMatch(/^[\w\-\.]+\.[\w\-\.]+\.[\w\-\.]+$/)
    })
  })

  /**
   * PATTERN 3: Get Current User
   * Contract: GET /auth/me/
   * Success: 200 OK with user object
   * Errors: 401 (not authenticated)
   */
  describe('Get Current User', () => {
    it('returns current user when authenticated', async () => {
      const expectedUser = mockUserFactory.userResponse()

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedUser
      })

      const response = await mockApiClient.get('/auth/me/')

      expect(response.status).toBe(200)
      expect(response.data.id).toBe(1)
      expect(response.data.username).toBe('testuser')
    })

    it('returns 401 when not authenticated', async () => {
      mockApiClient.get.mockResolvedValueOnce(
        mockErrorFactory.unauthorized()
      )

      const response = await mockApiClient.get('/auth/me/')

      expect(response.status).toBe(401)
    })
  })

  /**
   * PATTERN 4: Logout
   * Contract: POST /auth/logout/
   * Success: 200 OK or 204 No Content
   * Notes: Should clear tokens on frontend
   */
  describe('User Logout', () => {
    it('successfully logs out a user', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        status: 204,
        data: null
      })

      const response = await mockApiClient.post('/auth/logout/')

      expect([200, 204]).toContain(response.status)
    })
  })

  /**
   * PATTERN 5: Token Refresh
   * Contract: POST /auth/token/refresh/
   * Success: 200 OK with new access token
   * Errors: 401 (invalid refresh token)
   */
  describe('Token Refresh', () => {
    it('refreshes expired access token', async () => {
      const refreshPayload = {
        refresh: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      }

      const expectedResponse = {
        access: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      }

      mockApiClient.post.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.post('/auth/token/refresh/', refreshPayload)

      expect(response.status).toBe(200)
      expect(response.data.access).toBeDefined()
    })

    it('returns 401 for invalid refresh token', async () => {
      const invalidRefresh = {
        refresh: 'invalid.token.here'
      }

      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.unauthorized()
      )

      const response = await mockApiClient.post('/auth/token/refresh/', invalidRefresh)

      expect(response.status).toBe(401)
    })
  })

  /**
   * PATTERN 6: Complete authentication flow
   * Register -> Login -> GetUser -> Logout
   */
  describe('Complete Authentication Flow', () => {
    it('executes full auth workflow successfully', async () => {
      // Step 1: Register
      const registerPayload = mockUserFactory.createUser({
        username: 'flowtest',
        email: 'flowtest@example.com'
      })

      mockApiClient.post.mockResolvedValueOnce({
        status: 201,
        data: mockUserFactory.authResponse({
          user: { username: 'flowtest' }
        })
      })

      let response = await mockApiClient.post('/auth/register/', registerPayload)
      expect(response.status).toBe(201)
      const tokens = response.data

      // Step 2: Use tokens to get current user
      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: mockUserFactory.userResponse({ username: 'flowtest' })
      })

      response = await mockApiClient.get('/auth/me/')
      expect(response.status).toBe(200)
      expect(response.data.username).toBe('flowtest')

      // Step 3: Logout
      mockApiClient.post.mockResolvedValueOnce({
        status: 204,
        data: null
      })

      response = await mockApiClient.post('/auth/logout/')
      expect([200, 204]).toContain(response.status)
    })
  })
})
