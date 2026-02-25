import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import CourseDetails from '../CourseDetails.vue'

const mockCourse = {
  id: 1,
  name: 'Vue.js Basics',
  title: 'Vue.js Basics',
  description: 'Learn Vue.js from scratch with hands-on examples',
  instructor: 'John Doe',
  rating: 4.5,
  enrolled: 150,
  price: 29.99,
  image: '/course1.jpg',
  status: 'published',
  lessons: [
    { id: 1, title: 'Introduction', duration: 10 },
    { id: 2, title: 'Basics', duration: 20 },
    { id: 3, title: 'Advanced', duration: 30 }
  ]
}

const alternativeCourse = {
  id: 2,
  name: 'React.js Fundamentals',
  title: 'React.js Fundamentals',
  description: 'Master React.js development',
  instructor: 'Jane Smith',
  rating: 4.8,
  enrolled: 250,
  price: 39.99
}

describe('CourseDetails.vue - Comprehensive Examples', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  /**
   * PATTERN 1: Test rendering without data
   * Component should show fallback/empty state
   */
  describe('Empty state', () => {
    it('renders heading', () => {
      const wrapper = mount(CourseDetails)
      expect(wrapper.find('h1').text()).toContain('Course Details')
    })

    it('shows fallback message when no course provided', () => {
      const wrapper = mount(CourseDetails)
      expect(wrapper.text()).toContain('Select a course to see details')
    })

    it('does not show course name when no course', () => {
      const wrapper = mount(CourseDetails)
      expect(wrapper.text()).not.toContain('Vue.js Basics')
    })
  })

  /**
   * PATTERN 2: Test rendering with data
   * Verify component displays course information
   */
  describe('Rendering with course data', () => {
    it('displays course name from prop', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      expect(wrapper.text()).toContain('Vue.js Basics')
    })

    it('renders course information sections', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      const pElements = wrapper.findAll('p')
      expect(pElements.length).toBeGreaterThan(0)
    })

    it('hides fallback message when course provided', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      expect(wrapper.text()).not.toContain('Select a course to see details')
    })
  })

  /**
   * PATTERN 3: Test prop acceptance and validation
   * Verify component accepts different prop types
   */
  describe('Props handling', () => {
    it('accepts course object prop', () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      expect(wrapper.props('course')).toEqual(mockCourse)
    })

    it('accepts null course prop', () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: null
        }
      })

      expect(wrapper.props('course')).toBeNull()
    })

    it('accepts undefined course prop', () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: undefined
        }
      })

      expect(wrapper.props('course')).toBeUndefined()
    })

    it('handles partial course object', () => {
      const partialCourse = {
        id: 1,
        name: 'Partial Course'
      }

      const wrapper = mount(CourseDetails, {
        props: {
          course: partialCourse
        }
      })

      expect(wrapper.props('course')).toEqual(partialCourse)
    })
  })

  /**
   * PATTERN 4: Test prop updates (reactivity)
   * Verify component updates when props change
   */
  describe('Prop reactivity', () => {
    it('updates display when course prop changes', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      expect(wrapper.text()).toContain('Vue.js Basics')

      // Update prop
      await wrapper.setProps({
        course: alternativeCourse
      })
      await nextTick()

      expect(wrapper.text()).toContain('React.js Fundamentals')
      expect(wrapper.text()).not.toContain('Vue.js Basics')
    })

    it('updates internal state when prop changes', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      // Wait for watcher to update internal ref
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(wrapper.vm.course).toEqual(mockCourse)

      // Update prop
      await wrapper.setProps({
        course: alternativeCourse
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(wrapper.vm.course).toEqual(alternativeCourse)
    })

    it('shows fallback when prop changes to null', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      expect(wrapper.text()).toContain('Vue.js Basics')

      // Set to null
      await wrapper.setProps({
        course: null
      })
      await nextTick()

      expect(wrapper.text()).toContain('Select a course to see details')
    })
  })

  /**
   * PATTERN 5: Test watcher behavior
   * Verify watchers sync internal state with props
   */
  describe('Watcher behavior', () => {
    it('updates internal ref when prop changes', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(wrapper.vm.course).toEqual(mockCourse)
    })

    it('handles rapid prop updates', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()

      // Rapid updates
      await wrapper.setProps({ course: alternativeCourse })
      await wrapper.setProps({ course: mockCourse })
      await wrapper.setProps({ course: alternativeCourse })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should have latest value
      expect(wrapper.vm.course).toEqual(alternativeCourse)
    })
  })

  /**
   * PATTERN 6: Test conditional rendering
   * Verify different content displays based on state
   */
  describe('Conditional rendering', () => {
    it('shows course name paragraph when course exists', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      const pElements = wrapper.findAll('p')
      const hasCourseInfo = pElements.some(p => 
        p.text().includes('Course Name:') || p.text().includes('Vue.js Basics')
      )

      expect(hasCourseInfo).toBe(true)
    })

    it('shows fallback paragraph when no course', () => {
      const wrapper = mount(CourseDetails)
      const pElements = wrapper.findAll('p')
      const hasFallback = pElements.some(p => 
        p.text().includes('Select a course')
      )

      expect(hasFallback).toBe(true)
    })
  })

  /**
   * PATTERN 7: Test display data transformation
   * Verify data is displayed in correct format
   */
  describe('Data display transformation', () => {
    it('displays complete course information', async () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      const text = wrapper.text()

      // Verify all key info is present
      expect(text).toContain('Course Details')
      expect(text).toContain('Vue.js Basics')
    })

    it('handles course without optional fields', async () => {
      const minimalCourse = {
        id: 1,
        name: 'Minimal Course'
      }

      const wrapper = mount(CourseDetails, {
        props: {
          course: minimalCourse
        }
      })

      await nextTick()
      expect(wrapper.text()).toContain('Minimal Course')
    })
  })

  /**
   * PATTERN 8: Test lifecycle and cleanup
   * Verify component properly initializes and cleans up
   */
  describe('Lifecycle', () => {
    it('mounts successfully without errors', () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      expect(wrapper.vm).toBeDefined()
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('unmounts without errors', () => {
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })
  })

  /**
   * PATTERN 9: Test edge cases
   * Handle unusual but valid scenarios
   */
  describe('Edge cases', () => {
    it('handles course with empty string name', async () => {
      const emptyCourse = { ...mockCourse, name: '' }

      const wrapper = mount(CourseDetails, {
        props: {
          course: emptyCourse
        }
      })

      await nextTick()
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('handles very long course name', async () => {
      const longNameCourse = {
        ...mockCourse,
        name: 'A'.repeat(200)
      }

      const wrapper = mount(CourseDetails, {
        props: {
          course: longNameCourse
        }
      })

      await nextTick()
      expect(wrapper.vm).toBeDefined()
    })

    it('handles special characters in course name', async () => {
      const specialCourse = {
        ...mockCourse,
        name: 'Vue.js & React <with> "special" chars'
      }

      const wrapper = mount(CourseDetails, {
        props: {
          course: specialCourse
        }
      })

      await nextTick()
      expect(wrapper.vm).toBeDefined()
    })
  })

  /**
   * PATTERN 10: Test integration scenarios
   * Multiple actions in sequence
   */
  describe('Integration scenarios', () => {
    it('full user journey: view course -> update course -> reset', async () => {
      // Start with course
      const wrapper = mount(CourseDetails, {
        props: {
          course: mockCourse
        }
      })

      await nextTick()
      expect(wrapper.text()).toContain('Vue.js Basics')

      // Switch to different course
      await wrapper.setProps({ course: alternativeCourse })
      await nextTick()
      expect(wrapper.text()).toContain('React.js Fundamentals')

      // Clear course
      await wrapper.setProps({ course: null })
      await nextTick()
      expect(wrapper.text()).toContain('Select a course')
    })
  })
})
