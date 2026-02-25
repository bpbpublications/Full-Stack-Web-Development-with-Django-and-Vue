import { defineStore } from 'pinia'
import { courseService } from '../services/courseService'

const courseImage = new URL('../assets/pundits.png', import.meta.url).href

export const useCourseStore = defineStore('course', {
    state: () => ({
        courses: [],
        selectedCourse: null,
        loading: false,
        error: null
    }),
    actions: {
        async fetchCourses() {
            this.loading = true
            try {
                const response = await courseService.getAllCourses()
                const coursesData = response.data
                
                if (Array.isArray(coursesData)) {
                    this.courses = coursesData.map(course => ({
                        id: course.id,
                        title: course.title || course.name || '',
                        description: course.description || '',
                        instructor: course.instructor || '',
                        rating: course.rating || 0,
                        enrolled: course.enrolled || 0,
                        price: course.price || 0,
                        thumbnail: course.thumbnail || course.image || courseImage,
                        status: course.status || 'draft'
                    }))
                } else {
                    console.warn('Could not parse courses from response:', response.data)
                    this.courses = []
                }
                
                this.error = null
            } catch (err) {
                console.error('Error in fetchCourses:', err)
                this.error = err.message || 'Failed to fetch courses'
                this.courses = []
            } finally {
                this.loading = false
            }
        },
        
        async fetchCourseById(id) {
            this.loading = true
            try {
                const response = await courseService.getCourse(id)
                
                if (response.data) {
                    this.selectedCourse = {
                        id: response.data.id,
                        title: response.data.title || response.data.name,
                        description: response.data.description || '',
                        instructor: response.data.instructor || '',
                        rating: response.data.rating || 0,
                        enrolled: response.data.enrolled || 0,
                        price: response.data.price || 0,
                        thumbnail: response.data.thumbnail || response.data.image || courseImage,
                        status: response.data.status || 'draft'
                    }
                } else {
                    this.selectedCourse = null
                }
                
                return this.selectedCourse
            } catch (err) {
                this.error = err.message || 'Failed to fetch course'
                return null
            } finally {
                this.loading = false
            }
        },
        
        async createCourse(courseData) {
            this.loading = true
            try {
                console.log('Creating course in store with data:', 
                    courseData instanceof FormData ? 'FormData object' : courseData)
                
                const response = await courseService.createCourse(courseData)
                
                const newCourse = {
                    id: response.data.id,
                    title: response.data.title || response.data.name,
                    description: response.data.description || '',
                    instructor: response.data.instructor || '',
                    rating: response.data.rating || 0,
                    enrolled: response.data.enrolled || 0,
                    price: response.data.price || 0,
                    thumbnail: response.data.thumbnail || response.data.image || courseImage,
                    status: response.data.status || 'draft'
                }
                
                this.courses.push(newCourse)
                return newCourse
            } catch (err) {
                console.error('Error in createCourse:', err)
                this.error = err.message || 'Failed to create course'
                throw err
            } finally {
                this.loading = false
            }
        },
        
        async updateCourse(id, courseData) {
            this.loading = true
            try {
                console.log('Updating course in store with data:', 
                    courseData instanceof FormData ? 'FormData object' : courseData)
                
                const response = await courseService.updateCourse(id, courseData)
                
                const updatedCourse = {
                    id: response.data.id,
                    title: response.data.title || response.data.name,
                    description: response.data.description || '',
                    instructor: response.data.instructor || '',
                    rating: response.data.rating || 0,
                    enrolled: response.data.enrolled || 0,
                    price: response.data.price || 0,
                    thumbnail: response.data.thumbnail || response.data.image || courseImage,
                    status: response.data.status || 'draft',
                    subtitle: response.data.subtitle || '',
                    level: response.data.level || 'beginner'
                }
                
                const index = this.courses.findIndex(c => c.id === id)
                if (index !== -1) {
                    this.courses[index] = updatedCourse
                }
                
                return updatedCourse
            } catch (err) {
                this.error = err.message || 'Failed to update course'
                throw err
            } finally {
                this.loading = false
            }
        },
        
        async deleteCourse(id) {
            this.loading = true
            try {
                await courseService.deleteCourse(id)
                this.courses = this.courses.filter(course => course.id !== id)
                return true
            } catch (err) {
                this.error = err.message || 'Failed to delete course'
                throw err
            } finally {
                this.loading = false
            }
        },
        
        async toggleCourseStatus(id) {
            const course = this.courses.find(c => c.id === id)
            if (!course) return
            
            const newStatus = course.status === 'active' ? 'inactive' : 'active'
            
            try {
                await courseService.updateCourseStatus(id, newStatus)
                course.status = newStatus
                return true
            } catch (err) {
                this.error = err.message || 'Failed to update course status'
                throw err
            }
        }
    },
    getters: {
        getCourseById: (state) => (id) => {
            return state.courses.find(course => course.id === parseInt(id))
        },
        totalCourses: (state) => state.courses.length,
        activeCourses: (state) => state.courses.filter(course => course.status === 'active').length,
        draftCourses: (state) => state.courses.filter(course => course.status === 'draft').length
    }
})

















