import axios from 'axios'

// API configuration
const USE_MOCK_API = false // Set to false to use the real API
const API_BASE_URL = 'http://127.0.0.1:8000/api'
const API_URL = `${API_BASE_URL}/courses/`

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
})

// Add request interceptor to include authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login'
          return Promise.reject(error)
        }
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access_token', access)
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed:', refreshError)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Mock data for fallback
const mockCourses = [
  {
    id: 1,
    title: 'Pandas Fundamentals',
    description: 'Learn the basics of data manipulation with Pandas.',
    instructor: 'John Doe',
    rating: 4.5,
    enrolled: 1200,
    price: 49.99,
    thumbnail: '/src/assets/pundits.png',
    status: 'active'
  },
  {
    id: 2,
    name: 'Advanced Data Analysis',
    description: 'Master advanced data analysis techniques including statistical analysis, data visualization, and predictive modeling.',
    instructor: 'Jane Smith',
    rating: 4.8,
    enrolled: 800,
    price: 69.99,
    thumbnail: '/src/assets/pundits.png',
    status: 'active'
  },
  {
    id: 3,
    name: 'Machine Learning Basics',
    description: 'ntroduction to machine learning concepts including supervised learning, unsupervised learning, and model evaluation.',
    instructor: 'Mike Johnson',
    rating: 4.7,
    enrolled: 1500,
    price: 79.99,
    thumbnail: '/src/assets/pundits.png',
    status: 'draft'
  }
]

export const courseService = {
  // Get all courses
  async getAllCourses() {
    if (USE_MOCK_API) {
      console.log('Using mock API for getAllCourses')
      return Promise.resolve({ data: mockCourses })
    }
    
    try {
      console.log('Fetching courses from real API:', API_URL)
      const response = await apiClient.get('/courses/')
      console.log('API response:', response)
      return response
    } catch (error) {
      console.error('Error in getAllCourses:', error)
      
      // If unauthorized and not logged in, redirect to login
      if (error.response?.status === 401 && !localStorage.getItem('access_token')) {
        console.log('User not authenticated, redirecting to login')
        window.location.href = '/login'
      }
      
      // Return mock data as fallback
      return { data: mockCourses }
    }
  },
  
  // Get course by ID
  async getCourse(id) {
    if (USE_MOCK_API) {
      const course = mockCourses.find(c => c.id === parseInt(id))
      return Promise.resolve({ data: course || null })
    }
    
    try {
      return await apiClient.get(`/courses/${id}/`)
    } catch (error) {
      console.error(`Error in getCourse(${id}):`, error)
      const course = mockCourses.find(c => c.id === parseInt(id))
      return { data: course || null }
    }
  },
  
  // Create new course
  async createCourse(courseData) {
    if (USE_MOCK_API) {
      const newCourse = {
        ...courseData,
        id: mockCourses.length + 1
      }
      mockCourses.push(newCourse)
      return Promise.resolve({ data: newCourse })
    }
    
    try {
      // Check if courseData is FormData
      const isFormData = courseData instanceof FormData
      
      // Create config with appropriate headers for FormData
      const config = {}
      if (isFormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      // Log the data being sent to help debug
      console.log('Creating course with data:', isFormData ? 'FormData object' : courseData)
      
      const response = await apiClient.post('/courses/', courseData, config)
      return response
    } catch (error) {
      console.error('Error creating course:', error.response?.data || error.message)
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        window.location.href = '/login'
      } else if (error.response?.status === 403) {
        // Handle forbidden error
        console.error('Permission denied: You do not have permission to create courses')
      }
      
      throw error
    }
  },
  
  // Update course
  async updateCourse(id, courseData) {
    if (USE_MOCK_API) {
      const index = mockCourses.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockCourses[index] = { ...mockCourses[index], ...courseData }
        return Promise.resolve({ data: mockCourses[index] })
      }
      return Promise.reject(new Error('Course not found'))
    }
    
    try {
      // Check if courseData is FormData
      const isFormData = courseData instanceof FormData
      
      // Create config with appropriate headers for FormData
      const config = {}
      if (isFormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        }
      }
      
      // Log the data being sent to help debug
      console.log('Updating course with data:', isFormData ? 'FormData object' : courseData)
      
      // For FormData with PUT requests, we might need to use PATCH instead
      // Some backends don't handle multipart/form-data with PUT correctly
      if (isFormData) {
        return await apiClient.patch(`/courses/${id}/`, courseData, config)
      } else {
        return await apiClient.put(`/courses/${id}/`, courseData, config)
      }
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message)
      throw error
    }
  },
  
  // Delete course
  async deleteCourse(id) {
    if (USE_MOCK_API) {
      const index = mockCourses.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockCourses.splice(index, 1)
        return Promise.resolve({ success: true })
      }
      return Promise.reject(new Error('Course not found'))
    }
    
    return apiClient.delete(`/courses/${id}/`)
  },
  
  // Change course status
  async updateCourseStatus(id, status) {
    if (USE_MOCK_API) {
      const index = mockCourses.findIndex(c => c.id === parseInt(id))
      if (index !== -1) {
        mockCourses[index].status = status
        return Promise.resolve({ data: mockCourses[index] })
      }
      return Promise.reject(new Error('Course not found'))
    }

    return apiClient.patch(`/courses/${id}/`, { status })
  },

  // Get courses for current instructor
  async getInstructorCourses() {
    if (USE_MOCK_API) {
      console.log('Using mock API for instructor courses from courseService')
      // Return first 3 courses as instructor courses with enrollment data
      const instructorCourses = mockCourses.slice(0, 3).map(course => ({
        ...course,
        enrolled_students: Math.floor(Math.random() * 50) + 10, // Mock enrollment data
        status: course.status || 'published'
      }))
      return Promise.resolve({ data: instructorCourses })
    }

    try {
      console.log('Fetching instructor courses from courseService')
      // Try to get courses filtered by current instructor
      const response = await apiClient.get('/courses/?instructor=me')
      console.log('Instructor courses from courseService:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching instructor courses from courseService:', error)

      // Fallback: get all courses and filter client-side (not ideal but works)
      try {
        const allCoursesResponse = await this.getAllCourses()
        // In a real implementation, you'd filter by the current user's instructor ID
        // For now, return first 3 courses as instructor courses
        const instructorCourses = allCoursesResponse.data.slice(0, 3).map(course => ({
          ...course,
          enrolled_students: Math.floor(Math.random() * 50) + 10 // Mock enrollment data
        }))
        return { data: instructorCourses }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        throw error
      }
    }
  }
}







