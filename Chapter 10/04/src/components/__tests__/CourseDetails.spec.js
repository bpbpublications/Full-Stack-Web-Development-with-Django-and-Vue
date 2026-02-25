import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CourseDetails from '../CourseDetails.vue'

const mockCourse = {
  id: 1,
  name: 'Vue.js Basics',
  description: 'Learn Vue.js from scratch',
  instructor: 'John Doe',
  rating: 4.5,
  enrolled: 150,
  price: 29.99
}

describe('CourseDetails.vue', () => {
  it('renders heading', () => {
    const wrapper = mount(CourseDetails)
    expect(wrapper.find('h1').text()).toContain('Course Details')
  })

  it('shows fallback message when no course', () => {
    const wrapper = mount(CourseDetails)
    expect(wrapper.text()).toContain('Select a course to see details')
  })

  it('has p elements for display', () => {
    const wrapper = mount(CourseDetails)
    const pElements = wrapper.findAll('p')
    expect(pElements.length).toBeGreaterThan(0)
  })

  it('renders with course prop provided', async () => {
    const wrapper = mount(CourseDetails, {
      props: {
        course: mockCourse
      }
    })

    await nextTick()
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('renders template elements for course display', async () => {
    const wrapper = mount(CourseDetails, {
      props: {
        course: mockCourse
      }
    })

    await nextTick()
    const pElements = wrapper.findAll('p')
    expect(pElements.length).toBeGreaterThan(0)
  })

  it('accepts course prop as object', () => {
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

  it('updates when course prop changes', async () => {
    const newCourse = {
      id: 2,
      name: 'Advanced Vue.js'
    }

    const wrapper = mount(CourseDetails, {
      props: {
        course: mockCourse
      }
    })

    await wrapper.setProps({ course: newCourse })
    await nextTick()

    expect(wrapper.props('course')).toEqual(newCourse)
  })
})
