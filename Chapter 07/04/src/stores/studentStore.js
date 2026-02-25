import { defineStore } from 'pinia'
import { studentService } from '../services/studentService'

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    stats: {
      totalStudents: 0,
      activeLearners: 0,
      completions: 0,
      avgProgress: 0
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10
    },
    loading: false,
    error: null,
    currentFilters: {
      status: 'all',
      search: ''
    }
  }),

  getters: {
    getFilteredStudents: (state) => (statusFilter, searchQuery) => {
      return state.students.filter(student => {
        if (statusFilter !== 'all') {
          const isActive = statusFilter === 'active'
          if (student.status !== (isActive ? 'active' : 'inactive')) return false
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return student.name.toLowerCase().includes(query) ||
                 student.email.toLowerCase().includes(query)
        }
        return true
      })
    }
  },

  actions: {
    async fetchStudents(filters = {}, page = 1) {
      this.loading = true
      this.error = null
      this.currentFilters = {
        status: filters.status || 'all',
        search: filters.search || ''
      }
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), 15000)
        })
        const response = await Promise.race([
          studentService.getAllStudents(filters, page, this.pagination.pageSize),
          timeoutPromise
        ])
        console.log('Student list API response:', response.data)
        if (!response.data || !Array.isArray(response.data.results)) {
          console.error('Unexpected API response format:', response.data)
          throw new Error('Invalid response format from API')
        }
        this.students = response.data.results.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          enrolledCourses: student.enrolled_courses || 0,
          progress: student.progress || 0,
          lastActive: student.last_active,
          status: student.is_active ? 'active' : 'inactive',
          avatar: student.avatar,
          enrollments: student.enrollments || [
            ...(student.enrolled_courses > 0 ? [{
              id: Date.now() + Math.random(),
              courseId: 1,
              courseTitle: 'Introduction to Data Science',
              status: 'active',
              enrolledDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }] : []),
            ...(student.enrolled_courses > 1 ? [{
              id: Date.now() + Math.random() + 1,
              courseId: 2,
              courseTitle: 'Advanced Python Programming',
              status: 'active',
              enrolledDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
            }] : [])
          ]
        }))
        this.pagination = {
          currentPage: page,
          totalPages: Math.ceil(response.data.count / this.pagination.pageSize),
          totalItems: response.data.count,
          pageSize: this.pagination.pageSize
        }
        if (response.data.count !== undefined) {
          this.stats.totalStudents = response.data.count
          const activeLearners = this.students.filter(s => s.status === 'active').length
          if (page === 1 || this.students.length === response.data.count) {
            this.stats.activeLearners = activeLearners
          } else {
            const activeRatio = activeLearners / this.students.length
            this.stats.activeLearners = Math.round(activeRatio * response.data.count)
          }
        }
        return this.students
      } catch (error) {
        this.error = error.message || 'Failed to fetch students'
        console.error('Error fetching students:', error)
        this.students = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.currentPage = newPage
      await this.fetchStudents(this.currentFilters, newPage)
    },

    async fetchStudentStats() {
      this.error = null
      try {
        const response = await studentService.getStudentStats()
        if (!response.data) {
          throw new Error('Invalid response format from student stats API')
        }
        const data = response.data
        console.log('Processing student stats data:', data)
        const currentActiveLearners = this.stats.activeLearners
        this.stats = {
          totalStudents: typeof data.total === 'number' ? data.total : this.stats.totalStudents,
          activeLearners: typeof data.active === 'number' ? data.active : currentActiveLearners,
          completions: typeof data.completions === 'number' ? data.completions : this.stats.completions,
          avgProgress: typeof data.avg_progress === 'number' ? data.avg_progress : this.stats.avgProgress
        }
        console.log('Updated stats in store:', this.stats)
        return this.stats
      } catch (error) {
        console.error('Error in fetchStudentStats:', error)
        this.error = error.message || 'Failed to fetch student statistics'
        throw error
      }
    },

    async toggleStudentStatus(studentId) {
      const student = this.students.find(s => s.id === studentId)
      if (!student) {
        console.error('Student not found in store:', studentId)
        throw new Error('Student not found')
      }
      const currentStatus = student.status
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      student.status = newStatus
      try {
        const isActive = newStatus === 'active'
        console.log(`Calling API to toggle student ${studentId} status to ${isActive ? 'active' : 'inactive'}`)
        const response = await studentService.toggleStudentStatus(studentId, isActive)
        console.log('Toggle status API response:', response)
        if (this.stats) {
          if (newStatus === 'active' && currentStatus === 'inactive') {
            this.stats.activeLearners++
          } else if (newStatus === 'inactive' && currentStatus === 'active') {
            this.stats.activeLearners--
          }
        }
        return true
      } catch (error) {
        student.status = currentStatus
        console.error('Error toggling student status:', error)
        throw error
      }
    },

    async updateStudent(studentData) {
      try {
        console.log('Updating student in store:', studentData)
        const response = await studentService.updateStudent(studentData.id, {
          name: studentData.name,
          email: studentData.email,
          is_active: studentData.is_active
        })
        console.log('Update student API response:', response.data)
        const index = this.students.findIndex(s => s.id === studentData.id)
        if (index !== -1) {
          this.students[index] = {
            ...this.students[index],
            name: studentData.name,
            email: studentData.email,
            status: studentData.is_active ? 'active' : 'inactive'
          }
          console.log('Updated student in store:', this.students[index])
        } else {
          console.warn('Student not found in store after update:', studentData.id)
        }
        return response.data
      } catch (error) {
        console.error('Error updating student:', error)
        throw error
      }
    },

    async deleteStudent(studentId) {
      try {
        await studentService.deleteStudent(studentId)
        this.students = this.students.filter(s => s.id !== studentId)
        this.stats.totalStudents -= 1
        if (this.students.length === 0 && this.pagination.currentPage > 1) {
          await this.changePage(this.pagination.currentPage - 1)
        }
      } catch (error) {
        console.error('Error deleting student:', error)
        throw error
      }
    },

    async updateStudentWithFormData(id, formData) {
      this.loading = true
      this.error = null
      try {
        const response = await studentService.updateStudentWithFormData(id, formData)
        if (response.data) {
          const updatedStudent = {
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            status: response.data.is_active ? 'active' : 'inactive',
            avatar: response.data.avatar,
            phone: response.data.phone,
            location: response.data.location,
            bio: response.data.bio,
            enrolledCourses: response.data.enrolled_courses || 0,
            progress: response.data.progress || 0,
            lastActive: response.data.last_active
          }
          const index = this.students.findIndex(s => s.id === id)
          if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updatedStudent }
          }
          if (this.selectedStudent && this.selectedStudent.id === id) {
            this.selectedStudent = updatedStudent
          }
          return updatedStudent
        }
      } catch (error) {
        this.error = error.message || 'Failed to update student'
        console.error('Error updating student with form data:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})