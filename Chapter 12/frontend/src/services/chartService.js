import apiClient from './apiClient'


const API_BASE_URL = 'http://localhost:8000/api/analytics'


const USE_MOCK_API = false

export const chartService = {
 
  async getRevenueData(days = '30') {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          labels: generateDateLabels(days),
          datasets: [
            {
              label: 'Revenue',
              data: generateRandomData(parseInt(days), 500, 2000),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              tension: 0.4
            }
          ]
        }
      })
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/revenue/?days=${days}`)
      return {
        data: {
          labels: response.data.labels || [],
          datasets: [{
            label: 'Revenue',
            data: response.data.values || [],
            borderColor: '#05b83a',
            backgroundColor: 'rgba(5, 184, 58, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        stats: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue data')
    }
  },
  

  async getStudentData(days = '60') {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          labels: generateDateLabels(days),
          datasets: [
            {
              label: 'New Students',
              data: generateRandomData(parseInt(days), 10, 50),
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              tension: 0.4
            }
          ]
        }
      })
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/students/?days=${days}`)
      return {
        data: {
          labels: response.data.labels || [],
          datasets: [{
            label: 'New Students',
            data: response.data.values || [],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        stats: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch student data')
    }
  },
  
 
  async getCourseData(days = '90') {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          labels: generateDateLabels(days),
          datasets: [
            {
              label: 'Course Enrollments',
              data: generateRandomData(parseInt(days), 5, 30),
              borderColor: '#FF9800',
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              tension: 0.4
            }
          ]
        }
      })
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/courses/?days=${days}`)
      return {
        data: {
          labels: response.data.labels || [],
          datasets: [{
            label: 'Course Enrollments',
            data: response.data.values || [],
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        stats: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch course data')
    }
  },
  

  async getCourseCompletionData(days = '120') {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [
            {
              data: [65, 25, 10],
              backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
              borderWidth: 0
            }
          ]
        }
      })
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/completion/?days=${days}`)
      return {
        data: {
          labels: response.data.labels || ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            data: response.data.values || [],
            backgroundColor: [
              '#05b83a',
              '#FFC107',
              '#F44336'
            ],
            borderWidth: 0
          }]
        },
        stats: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching course completion data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch course completion data')
    }
  },
  
  /**
   * Get category distribution data for charts from backend API
   * @returns {Promise<Object>} Category distribution chart data
   */
  async getCategoryDistributionData() {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          labels: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other'],
          datasets: [
            {
              data: [30, 20, 15, 15, 10, 10],
              backgroundColor: [
                '#4CAF50', '#2196F3', '#FF9800',
                '#9C27B0', '#F44336', '#607D8B'
              ],
              borderWidth: 0
            }
          ]
        }
      })
    }

    try {
      const response = await apiClient.get(`${API_BASE_URL}/categories/`)
      return {
        data: {
          labels: response.data.labels || [],
          datasets: [{
            data: response.data.values || [],
            backgroundColor: [
              '#05b83a', '#2196F3', '#FF9800',
              '#9C27B0', '#F44336', '#607D8B',
              '#795548', '#009688', '#E91E63'
            ],
            borderWidth: 0
          }]
        },
        stats: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching category distribution data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch category distribution data')
    }
  },


  async getTopCoursesData() {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/top-courses/`)
      return {
        data: response.data.courses || [],
        stats: response.data.stats || {}
      }
    } catch (error) {
      console.error('Error fetching top courses data:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch top courses data')
    }
  }
}


function generateDateLabels(days) {
  const labels = []
  const today = new Date()
  
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  }
  
  return labels
}


function generateRandomData(count, min, max) {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  )
}