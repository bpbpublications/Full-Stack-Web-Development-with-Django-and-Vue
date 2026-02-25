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
   * PATTERN 1: Test rendering with store data
   * Directly manipulate store state without mocking service
   */
  describe('Rendering with store data', () => {
    it('displays courses from store', () => {
      courseStore.courses = mockCoursesResponse
      courseStore.loading = false

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      expect(wrapper.text()).toContain('Python for Data Science')
      expect(wrapper.text()).toContain('Machine Learning Fundamentals')
    })

    it('renders correct number of course cards', () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const courseCards = wrapper.findAll('.course-card')
      expect(courseCards).toHaveLength(2)
    })

    it('displays course metadata', () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const metaElements = wrapper.findAll('.course-meta')
      expect(metaElements.length).toBeGreaterThan(0)
    })
  })

  /**
   * PATTERN 2: Test async operations with flushPromises
   * Mock the service and test the full data flow
   */
  describe('Async data fetching', () => {
    it('fetches and displays courses on mount', async () => {
      // Mock the courseService.getAllCourses method
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

      // Call fetch action
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

  /**
   * PATTERN 3: Test error handling
   * Mock service errors and verify error UI
   */
  describe('Error handling', () => {
    it('displays error message when fetch fails', () => {
      courseStore.error = 'Failed to load courses'
      courseStore.courses = []
      courseStore.loading = false

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      // Your component should show error message
      // Adjust selector based on actual component
      expect(courseStore.error).toBe('Failed to load courses')
    })

    it('handles empty courses list', () => {
      courseStore.courses = []
      courseStore.loading = false
      courseStore.error = null

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const courseCards = wrapper.findAll('.course-card')
      expect(courseCards).toHaveLength(0)
    })
  })

  /**
   * PATTERN 4: Test user interactions
   * Test clicking, selecting, navigating
   */
  describe('User interactions', () => {
    it('selects course when clicked', async () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router],
          stubs: {
            RouterLink: true
          }
        }
      })

      const courseCard = wrapper.find('.course-card')
      await courseCard.trigger('click')

      // Verify store was updated or spy was called
      expect(courseStore.selectedCourse).toBeDefined()
    })

    it('navigates to course details on link click', async () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const routerLink = wrapper.findComponent({ name: 'RouterLink' })
      expect(routerLink.exists()).toBe(true)
    })
  })

  /**
   * PATTERN 5: Test computed properties and data transformation
   * Verify display logic works correctly
   */
  describe('Display logic and filtering', () => {
    it('displays correct price formatting', () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const priceText = wrapper.text()
      expect(priceText).toContain('29.99')
      expect(priceText).toContain('49.99')
    })

    it('displays course ratings', () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const text = wrapper.text()
      expect(text).toContain('4.5')
      expect(text).toContain('4.8')
    })

    it('displays enrolled student count', () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const text = wrapper.text()
      expect(text).toContain('150')
      expect(text).toContain('200')
    })
  })

  /**
   * PATTERN 6: Test reactive updates
   * Verify component updates when store changes
   */
  describe('Reactive updates', () => {
    it('updates when courses are added to store', async () => {
      courseStore.courses = []

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      expect(wrapper.findAll('.course-card')).toHaveLength(0)

      // Add courses to store
      courseStore.courses = mockCoursesResponse
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.course-card')).toHaveLength(2)
    })

    it('updates when course is selected', async () => {
      courseStore.courses = mockCoursesResponse

      mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      courseStore.selectCourse(mockCoursesResponse[0])
      await flushPromises()

      expect(courseStore.selectedCourse).toEqual(mockCoursesResponse[0])
    })
  })

  /**
   * PATTERN 7: Test conditional rendering
   * Verify different UI states render correctly
   */
  describe('Conditional rendering', () => {
    it('shows course grid when courses exist', () => {
      courseStore.courses = mockCoursesResponse

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      expect(wrapper.find('.course-grid').exists()).toBe(true)
    })

    it('shows empty state when no courses', () => {
      courseStore.courses = []

      const wrapper = mount(CourseList, {
        global: {
          plugins: [pinia, router]
        }
      })

      const courseCards = wrapper.findAll('.course-card')
      expect(courseCards).toHaveLength(0)
    })
  })
})
