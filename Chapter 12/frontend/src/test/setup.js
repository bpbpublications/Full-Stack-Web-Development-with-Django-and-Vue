import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createAppRouter } from '../router/routerFactory'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * Create a test router instance with memory history
 * @returns {Router} Vue Router configured for testing
 */
export function createTestRouter() {
  return createAppRouter('memory')
}

vi.mock('@/services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  }
}))

vi.mock('@/services/courseService', () => ({
  courseService: {
    getAllCourses: vi.fn(),
    getCourse: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
  }
}))

vi.mock('@/services/notificationService', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    markAsRead: vi.fn(),
  }
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      beforeEach: vi.fn(),
    })),
    useRoute: vi.fn(() => ({
      params: {},
      query: {},
      meta: {},
      fullPath: '/',
    })),
  }
})
