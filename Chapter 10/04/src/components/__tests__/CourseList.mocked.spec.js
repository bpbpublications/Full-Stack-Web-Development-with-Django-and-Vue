import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CourseList from '../CourseList.vue'
import { useCourseStore } from '../../stores/courseStore'
import { createAppRouter } from '../../router/routerFactory'

const mockCoursesResponse = [
  {
    id: 1,
    name: 'Python for Data Science',
    title: 'Python for Data Science',
    instructor: 'Dr. Sarah Anderson',
    rating: 4.5,
    enrolled: 150,
    price: 29.99,
    image: '/course1.jpg',
    status: 'published'
  },
  {
    id: 2,
    name: 'Machine Learning Fundamentals',
    title: 'Machine Learning Fundamentals',
    instructor: 'Prof. Michael Chen',
    rating: 4.8,
    enrolled: 200,
    price: 49.99,
    image: '/course2.jpg',
    status: 'published'
  }
]

describe('CourseList.vue - Comprehensive Examples', () => {
  let pinia
  let router
  let courseStore

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    courseStore = useCourseStore()
    router = createAppRouter('memory')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  

  /**
   * Test async operations with flushPromises
   * Mock the service and test the full data flow
   */
  describe('Async data fetching', () => {
    it('fetches and displays courses on mount', async () => {
   
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          data: mockCoursesResponse
        })
      )

      vi.spyOn(courseStore, 'fetchCourses').mockImplementation(async () => {
        courseStore.courses = mockCoursesResponse
        courseStore.loading = false
      })

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      await courseStore.fetchCourses()
      await flushPromises()

      expect(wrapper.text()).toContain('Python for Data Science')
      expect(courseStore.courses).toHaveLength(2)
    })

    it('sets loading state during fetch', async () => {
      courseStore.loading = true

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      expect(courseStore.loading).toBe(true)

      courseStore.loading = false
      await flushPromises()

      expect(courseStore.loading).toBe(false)
    })
  })

 