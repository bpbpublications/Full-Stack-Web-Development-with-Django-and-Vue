import apiClient from './apiClient'

// API URL for students
const API_URL = '/api/accounts/students/'

// Mock data for fallback (only used if USE_MOCK_API is true)
const mockStudents = []

// Flag to control mock API usage
const USE_MOCK_API = false

export const studentService = {
  // Get all students with optional filters
  async getAllStudents(filters = {}, page = 1, pageSize = 10) {
    if (USE_MOCK_API) {
      console.log('Using mock API for getAllStudents')
      return Promise.resolve({ data: { results: mockStudents, count: mockStudents.length } })
    }
    
    try {
      // Convert filters object to URL parameters
      const params = new URLSearchParams()
      
      // Handle status filter properly
      if (filters.status === 'active') {
        params.append('is_active', 'true')
      } else if (filters.status === 'inactive') {
        params.append('is_active', 'false')
      }
      
      if (filters.search) params.append('search', filters.search)
      
      // Add pagination parameters
      params.append('page', page)
      params.append('page_size', pageSize)
      
      const url = `${API_URL}?${params.toString()}`
      console.log('Fetching students from URL:', url)
      
      // Set a timeout for the request
      const response = await apiClient.get(url, { timeout: 10000 })
      
      // Log the response for debugging
      console.log('Student API response:', response.data)
      
      return response
    } catch (error) {
      console.error('Error in getAllStudents:', error)
      throw error
    }
  },

  // Get student statistics
  async getStudentStats() {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          total: mockStudents.length,
          active: mockStudents.filter(s => s.is_active).length,
          inactive: mockStudents.filter(s => !s.is_active).length
        }
      })
    }
    
    try {
      const response = await apiClient.get(`${API_URL}stats/`)
      
      // Log the response for debugging
      console.log('Student stats API response:', response.data)
      
      return response
    } catch (error) {
      console.error('Error fetching student stats:', error)
      throw error
    }
  },

  // Get student by ID
  async getStudentById(id) {
    if (USE_MOCK_API) {
      const student = mockStudents.find(s => s.id === parseInt(id))
      return Promise.resolve({ data: student || null })
    }
    
    try {
      return await apiClient.get(`${API_URL}${id}/`)
    } catch (error) {
      console.error(`Error fetching student (${id}):`, error)
      throw error
    }
  },

  // Toggle student active status
  async toggleStudentStatus(id, isActive) {
    if (USE_MOCK_API) {
      const index = mockStudents.findIndex(s => s.id === parseInt(id))
      if (index !== -1) {
        mockStudents[index].is_active = isActive
        return Promise.resolve({ data: mockStudents[index] })
      }
      return Promise.reject(new Error('Student not found'))
    }
    
    try {
      return await apiClient.patch(`${API_URL}${id}/`, {
        is_active: isActive
      })
    } catch (error) {
      console.error(`Error toggling student status (${id}):`, error)
      throw error
    }
  },

  // Update student information
  async updateStudent(id, studentData) {
    if (USE_MOCK_API) {
      const index = mockStudents.findIndex(s => s.id === parseInt(id))
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], ...studentData }
        return Promise.resolve({ data: mockStudents[index] })
      }
      return Promise.reject(new Error('Student not found'))
    }
    
    try {
      return await apiClient.patch(`${API_URL}${id}/`, studentData)
    } catch (error) {
      console.error(`Error updating student (${id}):`, error)
      throw error
    }
  },

  // Delete a student
  async deleteStudent(id) {
    if (USE_MOCK_API) {
      const index = mockStudents.findIndex(s => s.id === parseInt(id))
      if (index !== -1) {
        mockStudents.splice(index, 1)
        return Promise.resolve({ success: true })
      }
      return Promise.reject(new Error('Student not found'))
    }
    
    try {
      return await apiClient.delete(`${API_URL}${id}/`)
    } catch (error) {
      console.error(`Error deleting student (${id}):`, error)
      throw error
    }
  },

  // Update student with form data
  async updateStudentWithFormData(id, formData) {
    if (USE_MOCK_API) {
      return this.updateStudent(id, Object.fromEntries(formData))
    }
    
    try {
      return await apiClient.patch(`${API_URL}${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error(`Error updating student with form data (${id}):`, error)
      throw error
    }
  }
}



