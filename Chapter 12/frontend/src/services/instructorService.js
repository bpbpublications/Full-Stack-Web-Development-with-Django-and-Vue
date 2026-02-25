import apiClient from './apiClient'

// API URL for instructors
const API_URL = '/api/accounts/instructors/'

// Flag to control mock API usage
const USE_MOCK_API = true

export const instructorService = {
  // Get all instructors with optional filters
  async getAllInstructors(filters = {}, page = 1, pageSize = 10) {
    if (USE_MOCK_API) {
      console.log('Using mock API for getAllInstructors')

      const mockInstructors = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          specialization: 'Data Science Expert',
          is_active: true,
          courses_count: 12,
          students_count: 2500,
          average_rating: 4.8,
          avatar: null
        },
        {
          id: 2,
          name: 'Prof. Michael Chen',
          email: 'michael.chen@example.com',
          specialization: 'Machine Learning Specialist',
          is_active: true,
          courses_count: 8,
          students_count: 1800,
          average_rating: 4.9,
          avatar: null
        },
        {
          id: 3,
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@example.com',
          specialization: 'Web Development Expert',
          is_active: false,
          courses_count: 15,
          students_count: 3200,
          average_rating: 4.6,
          avatar: null
        },
        {
          id: 4,
          name: 'James Wilson',
          email: 'james.wilson@example.com',
          specialization: 'Mobile App Development',
          is_active: true,
          courses_count: 6,
          students_count: 950,
          average_rating: 4.7,
          avatar: null
        },
        {
          id: 5,
          name: 'Dr. Lisa Thompson',
          email: 'lisa.thompson@example.com',
          specialization: 'Cybersecurity Expert',
          is_active: true,
          courses_count: 10,
          students_count: 1600,
          average_rating: 4.8,
          avatar: null
        }
      ]

      // Apply filters
      let filteredInstructors = mockInstructors

      if (filters.status === 'active') {
        filteredInstructors = filteredInstructors.filter(i => i.is_active)
      } else if (filters.status === 'inactive') {
        filteredInstructors = filteredInstructors.filter(i => !i.is_active)
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredInstructors = filteredInstructors.filter(i =>
          i.name.toLowerCase().includes(searchTerm) ||
          i.specialization.toLowerCase().includes(searchTerm) ||
          i.email.toLowerCase().includes(searchTerm)
        )
      }

      return Promise.resolve({
        data: filteredInstructors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredInstructors.length / pageSize),
          totalItems: filteredInstructors.length,
          pageSize: pageSize
        }
      })
    }
    
    try {
      // Convert filters object to URL parameters
      const params = new URLSearchParams()
      
      // Handle status filter
      if (filters.status === 'active') {
        params.append('is_active', 'true')
      } else if (filters.status === 'inactive') {
        params.append('is_active', 'false')
      }
      
      // Handle search filter
      if (filters.search) params.append('search', filters.search)
      
      // Add pagination parameters
      params.append('page', page)
      params.append('page_size', pageSize)
      
      const url = `${API_URL}?${params.toString()}`
      console.log('Fetching instructors from URL:', url)
      
      // Set a longer timeout for the request
      const response = await apiClient.get(url, { timeout: 15000 })
      
      // Log the raw response for debugging
      console.log('Raw instructor API response:', response);
      console.log('Instructor API response data:', response.data);
      
      // Ensure we always return a valid response
      if (!response.data) {
        console.warn('Empty response data from instructor API');
        return { data: [] };
      }
      
      return response;
    } catch (error) {
      console.error('Error in getAllInstructors:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw error;
    }
  },
  
  // Get instructor by ID
  async getInstructorById(id) {
    if (USE_MOCK_API) {
      const mockInstructorDetails = {
        1: {
          id: 1,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          specialization: 'Data Science Expert',
          is_active: true,
          courses_count: 12,
          students_count: 2500,
          average_rating: 4.8,
          bio: 'Dr. Sarah Johnson is a renowned data scientist with over 10 years of experience in the field. She has worked with major tech companies and has published several research papers on machine learning and artificial intelligence.',
          phone: '+1 (555) 123-4567',
          website: 'www.sarahjohnson.com',
          avatar: null,
          courses: [
            { id: 1, title: 'Introduction to Data Science', students: 450, rating: 4.9 },
            { id: 2, title: 'Advanced Machine Learning', students: 320, rating: 4.8 },
            { id: 3, title: 'Python for Data Analysis', students: 680, rating: 4.7 }
          ],
          reviews: [
            { id: 1, student: 'John Smith', rating: 5, comment: 'Excellent instructor!', date: '2024-01-15' },
            { id: 2, student: 'Jane Doe', rating: 4, comment: 'Very knowledgeable', date: '2024-01-10' }
          ]
        },
        2: {
          id: 2,
          name: 'Prof. Michael Chen',
          email: 'michael.chen@example.com',
          specialization: 'Machine Learning Specialist',
          is_active: true,
          courses_count: 8,
          students_count: 1800,
          average_rating: 4.9,
          bio: 'Professor Michael Chen specializes in machine learning and artificial intelligence. He has been teaching for over 15 years and has extensive industry experience.',
          phone: '+1 (555) 234-5678',
          website: 'www.michaelchen.edu',
          avatar: null,
          courses: [
            { id: 4, title: 'Deep Learning Fundamentals', students: 380, rating: 4.9 },
            { id: 5, title: 'Neural Networks', students: 290, rating: 4.8 }
          ],
          reviews: [
            { id: 3, student: 'Alice Johnson', rating: 5, comment: 'Amazing teacher!', date: '2024-01-12' }
          ]
        },
        3: {
          id: 3,
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@example.com',
          specialization: 'Web Development Expert',
          is_active: false,
          courses_count: 15,
          students_count: 3200,
          average_rating: 4.6,
          bio: 'Dr. Emily Rodriguez is a full-stack web developer with expertise in modern frameworks and technologies.',
          phone: '+1 (555) 345-6789',
          website: 'www.emilyrodriguez.dev',
          avatar: null,
          courses: [],
          reviews: []
        }
      }

      const instructor = mockInstructorDetails[id]
      if (!instructor) {
        throw new Error('Instructor not found')
      }

      return Promise.resolve({ data: instructor })
    }
    
    try {
      console.log(`Fetching instructor with ID: ${id}`)
      const response = await apiClient.get(`${API_URL}${id}/`)
      console.log('Instructor details API response:', response.data)
      return response
    } catch (error) {
      console.error(`Error fetching instructor ${id}:`, error)
      throw error
    }
  },
  
  // Get instructor statistics
  async getInstructorStats() {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          total: 10,
          active: 8,
          pending: 2,
          average_rating: 4.7
        }
      })
    }
    
    try {
      console.log('Fetching instructor stats')
      const response = await apiClient.get(`${API_URL}stats/`)
      
      // Log the response for debugging
      console.log('Instructor stats API response:', response.data)
      
      return response
    } catch (error) {
      console.error('Error fetching instructor stats:', error)
      
      // If the stats endpoint fails, return mock data as fallback
      if (USE_MOCK_API) {
        return Promise.resolve({
          data: {
            total: 45,
            active: 38,
            pending: 7,
            average_rating: 4.5
          }
        })
      }
      
      throw error
    }
  },
  
  // Toggle instructor status (active/inactive)
  async toggleInstructorStatus(instructorId, isActive) {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: { success: true } })
    }

    try {
      console.log(`Toggling instructor ${instructorId} status to ${isActive ? 'active' : 'inactive'}`)
      const response = await apiClient.patch(`${API_URL}${instructorId}/`, {
        is_active: isActive
      })
      console.log('Toggle status API response:', response.data)
      return response
    } catch (error) {
      console.error(`Error toggling instructor ${instructorId} status:`, error)
      throw error
    }
  },

  // Get courses for current instructor
  async getInstructorCourses() {
    if (USE_MOCK_API) {
      console.log('Using mock API for instructor courses')
      return Promise.resolve({
        data: [
          { id: 1, title: 'JavaScript Fundamentals', enrolled_students: 25, status: 'published' },
          { id: 2, title: 'React Advanced Concepts', enrolled_students: 18, status: 'published' },
          { id: 3, title: 'Node.js Backend Development', enrolled_students: 22, status: 'draft' }
        ]
      })
    }

    try {
      console.log('Fetching instructor courses from backend')

      // Try multiple possible endpoints for instructor courses
      let response
      const endpoints = [
        '/api/instructor/courses/',
        '/api/courses/instructor/',
        '/api/courses/?instructor=current',
        '/courses/instructor/'
      ]

      let lastError = null
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          response = await apiClient.get(endpoint)
          console.log(`Success with endpoint: ${endpoint}`, response.data)
          break
        } catch (error) {
          console.log(`Failed endpoint ${endpoint}:`, error.response?.status || error.message)
          lastError = error
          if (error.response?.status !== 404) {
            // If it's not a 404, it might be a more serious error
            throw error
          }
        }
      }

      if (!response) {
        throw lastError || new Error('All instructor course endpoints failed')
      }

      console.log('Instructor courses API response:', response.data)
      return response
    } catch (error) {
      console.error('Error fetching instructor courses:', error)
      console.log('Falling back to mock data for instructor courses')

      // Return mock data as fallback with more realistic data
      return Promise.resolve({
        data: [
          {
            id: 1,
            title: 'JavaScript Fundamentals',
            enrolled_students: 25,
            status: 'published',
            description: 'Learn the basics of JavaScript programming'
          },
          {
            id: 2,
            title: 'React Advanced Concepts',
            enrolled_students: 18,
            status: 'published',
            description: 'Master advanced React patterns and techniques'
          },
          {
            id: 3,
            title: 'Node.js Backend Development',
            enrolled_students: 22,
            status: 'draft',
            description: 'Build scalable backend applications with Node.js'
          }
        ]
      })
    }
  }
}


