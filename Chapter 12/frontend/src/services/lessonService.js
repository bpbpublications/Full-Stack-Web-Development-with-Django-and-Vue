import apiClient from './apiClient'

// API URL for lessons
const API_URL = '/api/lessons/'

export const lessonService = {
  // Get all lessons for a course
  async getLessonsForCourse(courseId) {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/lessons/`)
      console.log(`Lessons for course ${courseId}:`, response.data)
      return response
    } catch (error) {
      console.error(`Error fetching lessons for course ${courseId}:`, error)
      throw error
    }
  },
  
  // Get lesson by ID
  async getLessonById(id) {
    try {
      return await apiClient.get(`${API_URL}${id}/`)
    } catch (error) {
      console.error(`Error fetching lesson (${id}):`, error)
      throw error
    }
  },
  
  // Create a new lesson
  async createLesson(lessonData) {
    try {
      return await apiClient.post(API_URL, lessonData)
    } catch (error) {
      console.error('Error creating lesson:', error)
      throw error
    }
  },
  
  // Update lesson information
  async updateLesson(id, lessonData) {
    try {
      return await apiClient.patch(`${API_URL}${id}/`, lessonData)
    } catch (error) {
      console.error(`Error updating lesson (${id}):`, error)
      throw error
    }
  },
  
  // Delete a lesson
  async deleteLesson(id) {
    try {
      return await apiClient.delete(`${API_URL}${id}/`)
    } catch (error) {
      console.error(`Error deleting lesson (${id}):`, error)
      throw error
    }
  },
  
  // Update lesson with form data (for file uploads)
  async updateLessonWithFormData(id, formData) {
    try {
      return await apiClient.patch(`${API_URL}${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error(`Error updating lesson with form data (${id}):`, error)
      throw error
    }
  }
}
