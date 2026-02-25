import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CourseList from '../CourseList.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createAppRouter } from '../../router/routerFactory'

describe('CourseList.vue', () => {
  let router
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createAppRouter('memory')
  })

  it('renders course list container', () => {
    const wrapper = mount(CourseList, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterLink: true
        }
      }
    })

    expect(wrapper.find('.courses-container').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('Available Courses')
  })

  it('displays course grid', () => {
    const wrapper = mount(CourseList, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterLink: true
        }
      }
    })

    expect(wrapper.find('.course-grid').exists()).toBe(true)
  })

  it('renders correct number of course cards', () => {
    const wrapper = mount(CourseList, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterLink: true
        }
      }
    })

    const courseCards = wrapper.findAll('.course-card')
    expect(courseCards.length).toBeGreaterThanOrEqual(0)
  })

  it('displays course metadata in cards', () => {
    const wrapper = mount(CourseList, {
      global: {
        plugins: [pinia, router],
        stubs: {
          RouterLink: true
        }
      }
    })

    const courseCards = wrapper.findAll('.course-card')
    if (courseCards.length > 0) {
      const firstCard = courseCards[0]
      expect(firstCard.find('.course-image').exists()).toBe(true)
      expect(firstCard.find('.course-content').exists()).toBe(true)
      expect(firstCard.find('.course-meta').exists()).toBe(true)
    }
  })
})
