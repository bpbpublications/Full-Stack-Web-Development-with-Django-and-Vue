import { defineStore } from 'pinia'
import { chartService } from '../services/chartService'

export const useChartStore = defineStore('chart', {
  state: () => ({
    revenueData: null,
    studentData: null,
    courseData: null,
    courseCompletionData: null,
    categoryDistributionData: null,
    topCoursesData: null,
    revenueStats: null,
    studentStats: null,
    courseStats: null,
    loading: {
      revenue: false,
      student: false,
      course: false,
      courseCompletion: false,
      categoryDistribution: false,
      topCourses: false
    },
    error: {
      revenue: null,
      student: null,
      course: null,
      courseCompletion: null,
      categoryDistribution: null,
      topCourses: null
    },
    timeRanges: {
      revenue: '30',
      student: '60',
      course: '90',
      completion: '120'
    }
  }),
  
  actions: {
    /**
     * Set time range for specific chart type
     * @param {string} chartType - Type of chart (revenue, student, course, completion)
     * @param {string} range - Time range in days
     */
    setTimeRange(chartType, range) {
      if (this.timeRanges.hasOwnProperty(chartType)) {
        this.timeRanges[chartType] = range
      }
    },

    /**
     * Fetch revenue data for charts
     * @param {string} days - Number of days (optional, uses store value if not provided)
     */
    async fetchRevenueData(days = null) {
      this.loading.revenue = true
      this.error.revenue = null

      try {
        const daysToUse = days || this.timeRanges.revenue
        const response = await chartService.getRevenueData(daysToUse)
        this.revenueData = response.data
        this.revenueStats = response.stats
        return this.revenueData
      } catch (error) {
        this.error.revenue = error.message || 'Failed to fetch revenue data'
        console.error('Error in fetchRevenueData:', error)
        throw error
      } finally {
        this.loading.revenue = false
      }
    },
    
    /**
     * Fetch student analytics data for charts
     * @param {string} days - Number of days (optional, uses store value if not provided)
     */
    async fetchStudentData(days = null) {
      this.loading.student = true
      this.error.student = null

      try {
        const daysToUse = days || this.timeRanges.student
        const response = await chartService.getStudentData(daysToUse)
        this.studentData = response.data
        this.studentStats = response.stats
        return this.studentData
      } catch (error) {
        this.error.student = error.message || 'Failed to fetch student data'
        console.error('Error in fetchStudentData:', error)
        throw error
      } finally {
        this.loading.student = false
      }
    },
    
   
    async fetchCourseData(days = null) {
      this.loading.course = true
      this.error.course = null

      try {
        const daysToUse = days || this.timeRanges.course
        const response = await chartService.getCourseData(daysToUse)
        this.courseData = response.data
        this.courseStats = response.stats
        return this.courseData
      } catch (error) {
        this.error.course = error.message || 'Failed to fetch course data'
        console.error('Error in fetchCourseData:', error)
        throw error
      } finally {
        this.loading.course = false
      }
    },
    
    
    async fetchCourseCompletionData(days = null) {
      this.loading.courseCompletion = true
      this.error.courseCompletion = null

      try {
        const daysToUse = days || this.timeRanges.completion
        const response = await chartService.getCourseCompletionData(daysToUse)
        this.courseCompletionData = response.data
        return this.courseCompletionData
      } catch (error) {
        this.error.courseCompletion = error.message || 'Failed to fetch course completion data'
        console.error('Error in fetchCourseCompletionData:', error)
        throw error
      } finally {
        this.loading.courseCompletion = false
      }
    },
    
    
    async fetchCategoryDistributionData() {
      this.loading.categoryDistribution = true
      this.error.categoryDistribution = null

      try {
        const response = await chartService.getCategoryDistributionData()
        this.categoryDistributionData = response.data
        return this.categoryDistributionData
      } catch (error) {
        this.error.categoryDistribution = error.message || 'Failed to fetch category distribution data'
        console.error('Error in fetchCategoryDistributionData:', error)
        throw error
      } finally {
        this.loading.categoryDistribution = false
      }
    },

   
    async fetchTopCoursesData() {
      this.loading.topCourses = true
      this.error.topCourses = null

      try {
        const response = await chartService.getTopCoursesData()
        this.topCoursesData = response.data
        return this.topCoursesData
      } catch (error) {
        this.error.topCourses = error.message || 'Failed to fetch top courses data'
        console.error('Error in fetchTopCoursesData:', error)
        throw error
      } finally {
        this.loading.topCourses = false
      }
    },
    
   
    async fetchAllChartData() {
      try {
        await Promise.all([
          this.fetchRevenueData(),
          this.fetchStudentData(),
          this.fetchCourseData(),
          this.fetchCourseCompletionData(),
          this.fetchCategoryDistributionData(),
          this.fetchTopCoursesData()
        ])
        return true
      } catch (error) {
        console.error('Error fetching all chart data:', error)
        return false
      }
    }
  }
})