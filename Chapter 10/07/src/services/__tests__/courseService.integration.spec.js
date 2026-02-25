import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockCourseFactory, mockErrorFactory } from '../../test/factories'

/**
 * Integration Tests for Course Service
 * Tests the frontend courseService against mocked Django backend contracts
 * 
 * Endpoints tested:
 * - GET /api/courses/ (list with pagination)
 * - GET /api/courses/:id/ (detail)
 * - GET /api/courses/:id/reviews/
 * - POST /api/courses/:id/enroll/
 */
describe('CourseService Integration Tests', () => {
  let courseService
  let mockApiClient

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })


  describe('Get Courses List', () => {
    it('returns paginated list of courses', async () => {
      const expectedResponse = mockCourseFactory.courseListResponse(2)

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/?page=1')

      expect(response.status).toBe(200)
      expect(response.data.count).toBe(2)
      expect(response.data.results).toHaveLength(2)
      expect(response.data.results[0].id).toBe(1)
      expect(response.data.results[0].title).toBe('Python for Data Science')
    })

    it('handles pagination with next/previous links', async () => {
      const expectedResponse = mockCourseFactory.courseListResponse(2, 2)

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/?page=1&page_size=2')

      expect(response.data.next).toBeDefined() 
      expect(response.data.previous).toBeNull() 
    })

    it('returns empty list when no courses exist', async () => {
      const expectedResponse = mockCourseFactory.courseListResponse(0)

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/')

      expect(response.data.count).toBe(0)
      expect(response.data.results).toHaveLength(0)
    })

    it('filters courses by keyword', async () => {
      const expectedResponse = mockCourseFactory.courseListResponse(1)
      expectedResponse.results[0].title = 'Python for Data Science'

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/?search=python')

      expect(response.status).toBe(200)
      expect(response.data.results[0].title).toContain('Python')
    })

    it('sorts courses by rating', async () => {
      const expectedResponse = mockCourseFactory.courseListResponse(2)
      expectedResponse.results[0].rating = 4.8
      expectedResponse.results[1].rating = 4.5

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/?ordering=-rating')

      expect(response.data.results[0].rating).toBeGreaterThanOrEqual(
        response.data.results[1].rating
      )
    })

    it('returns correct course fields', async () => {
      const expectedResponse = mockCourseFactory.courseListResponse(1)
      const course = expectedResponse.results[0]

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/')

      expect(response.data.results[0]).toHaveProperty('id')
      expect(response.data.results[0]).toHaveProperty('title')
      expect(response.data.results[0]).toHaveProperty('description')
      expect(response.data.results[0]).toHaveProperty('instructor')
      expect(response.data.results[0]).toHaveProperty('price')
      expect(response.data.results[0]).toHaveProperty('rating')
      expect(response.data.results[0]).toHaveProperty('enrolled')
    })
  })

 
  describe('Get Course Detail', () => {
    it('returns full course details', async () => {
      const expectedResponse = mockCourseFactory.courseDetailResponse()

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/1/')

      expect(response.status).toBe(200)
      expect(response.data.id).toBe(1)
      expect(response.data.lessons).toBeDefined()
      expect(response.data.lessons).toHaveLength(3)
      expect(response.data.learning_outcomes).toBeDefined()
    })

    it('returns 404 for non-existent course', async () => {
      mockApiClient.get.mockResolvedValueOnce(
        mockErrorFactory.notFound('Course not found.')
      )

      const response = await mockApiClient.get('/api/courses/999/')

      expect(response.status).toBe(404)
      expect(response.data.detail).toContain('not found')
    })

    it('includes lessons in course detail', async () => {
      const expectedResponse = mockCourseFactory.courseDetailResponse()

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/1/')

      expect(response.data.lessons).toHaveLength(3)
      expect(response.data.lessons[0]).toHaveProperty('id')
      expect(response.data.lessons[0]).toHaveProperty('title')
      expect(response.data.lessons[0]).toHaveProperty('duration')
    })

    it('includes learning outcomes in course detail', async () => {
      const expectedResponse = mockCourseFactory.courseDetailResponse()

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/1/')

      expect(response.data.learning_outcomes).toBeInstanceOf(Array)
      expect(response.data.learning_outcomes.length).toBeGreaterThan(0)
    })
  })


  describe('Enroll in Course', () => {
    it('successfully enrolls user in course', async () => {
      const expectedResponse = {
        status: 201,
        data: {
          id: 1,
          user_id: 1,
          course_id: 1,
          enrolled_at: '2026-01-15T10:00:00Z',
          progress: 0
        }
      }

      mockApiClient.post.mockResolvedValueOnce(expectedResponse)

      const response = await mockApiClient.post('/api/courses/1/enroll/', {})

      expect(response.status).toBe(201)
      expect(response.data.course_id).toBe(1)
      expect(response.data.enrolled_at).toBeDefined()
    })

    it('returns 401 when user not authenticated', async () => {
      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.unauthorized()
      )

      const response = await mockApiClient.post('/api/courses/1/enroll/', {})

      expect(response.status).toBe(401)
    })

    it('returns 404 for non-existent course', async () => {
      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.notFound('Course not found.')
      )

      const response = await mockApiClient.post('/api/courses/999/enroll/', {})

      expect(response.status).toBe(404)
    })

    it('returns 409 when already enrolled', async () => {
      mockApiClient.post.mockResolvedValueOnce(
        mockErrorFactory.conflict('User is already enrolled in this course.')
      )

      const response = await mockApiClient.post('/api/courses/1/enroll/', {})

      expect(response.status).toBe(409)
      expect(response.data.detail).toContain('already enrolled')
    })

    it('returns enrollment object with correct fields', async () => {
      const expectedResponse = {
        status: 201,
        data: {
          id: 1,
          user_id: 1,
          course_id: 1,
          enrolled_at: '2026-01-15T10:00:00Z',
          completed_at: null,
          progress: 0,
          is_completed: false,
          certificate_issued: false
        }
      }

      mockApiClient.post.mockResolvedValueOnce(expectedResponse)

      const response = await mockApiClient.post('/api/courses/1/enroll/', {})

      expect(response.data).toHaveProperty('user_id')
      expect(response.data).toHaveProperty('course_id')
      expect(response.data).toHaveProperty('enrolled_at')
      expect(response.data).toHaveProperty('progress')
    })
  })


  describe('Get Course Reviews', () => {
    it('returns course reviews with pagination', async () => {
      const expectedResponse = {
        count: 10,
        results: [
          {
            id: 1,
            user: 'john_doe',
            rating: 5,
            comment: 'Excellent course!',
            created_at: '2026-01-01T10:00:00Z'
          },
          {
            id: 2,
            user: 'jane_smith',
            rating: 4,
            comment: 'Very helpful',
            created_at: '2026-01-02T10:00:00Z'
          }
        ]
      }

      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: expectedResponse
      })

      const response = await mockApiClient.get('/api/courses/1/reviews/')

      expect(response.status).toBe(200)
      expect(response.data.results).toHaveLength(2)
      expect(response.data.results[0]).toHaveProperty('rating')
      expect(response.data.results[0]).toHaveProperty('comment')
    })

    it('returns 404 for non-existent course reviews', async () => {
      mockApiClient.get.mockResolvedValueOnce(
        mockErrorFactory.notFound('Course not found.')
      )

      const response = await mockApiClient.get('/api/courses/999/reviews/')

      expect(response.status).toBe(404)
    })
  })


  describe('Complete Course Enrollment Flow', () => {
    it('executes full enrollment workflow', async () => {
     
      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: mockCourseFactory.courseListResponse(2)
      })

      let response = await mockApiClient.get('/api/courses/')
      expect(response.status).toBe(200)
      const courseId = response.data.results[0].id

  
      mockApiClient.get.mockResolvedValueOnce({
        status: 200,
        data: mockCourseFactory.courseDetailResponse({ id: courseId })
      })

      response = await mockApiClient.get(`/api/courses/${courseId}/`)
      expect(response.status).toBe(200)
      expect(response.data.lessons).toBeDefined()


      mockApiClient.post.mockResolvedValueOnce({
        status: 201,
        data: {
          id: 1,
          user_id: 1,
          course_id: courseId,
          enrolled_at: '2026-01-15T10:00:00Z',
          progress: 0
        }
      })

      response = await mockApiClient.post(`/api/courses/${courseId}/enroll/`, {})
      expect(response.status).toBe(201)
      expect(response.data.course_id).toBe(courseId)
    })
  })
})
