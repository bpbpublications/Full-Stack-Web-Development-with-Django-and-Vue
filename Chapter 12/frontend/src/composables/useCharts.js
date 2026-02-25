import { ref, computed, watch } from 'vue'
import { useChartStore } from '../stores/chartStore'

/**
 * Vue composable for chart data management
 * @param {Object} options - Configuration options
 * @returns {Object} Chart data and methods
 */
export function useCharts(options = {}) {
  const chartStore = useChartStore()
  const autoFetch = options.autoFetch !== false

  // Track loading and error states
  const isLoading = computed(() => {
    return Object.values(chartStore.loading).some(state => state === true)
  })

  const hasError = computed(() => {
    return Object.values(chartStore.error).some(err => err !== null)
  })
  
  // Computed properties for chart data
  const revenueData = computed(() => chartStore.revenueData)
  const studentData = computed(() => chartStore.studentData)
  const courseData = computed(() => chartStore.courseData)
  const courseCompletionData = computed(() => chartStore.courseCompletionData)
  const categoryDistributionData = computed(() => chartStore.categoryDistributionData)
  const topCoursesData = computed(() => chartStore.topCoursesData)

  // Computed properties for stats
  const revenueStats = computed(() => chartStore.revenueStats)
  const studentStats = computed(() => chartStore.studentStats)
  const courseStats = computed(() => chartStore.courseStats)

  // Method to update time range for specific chart type
  const updateTimeRange = async (chartType, range) => {
    chartStore.setTimeRange(chartType, range)

    if (autoFetch) {
      await fetchSpecificChart(chartType)
    }
  }
  
  // Method to fetch all chart data
  const fetchChartData = async () => {
    try {
      await chartStore.fetchAllChartData()
      return true
    } catch (error) {
      console.error('Error in fetchChartData:', error)
      return false
    }
  }
  
  // Method to fetch specific chart data
  const fetchSpecificChart = async (chartType, days = null) => {
    try {
      switch (chartType) {
        case 'revenue':
          await chartStore.fetchRevenueData(days)
          break
        case 'student':
          await chartStore.fetchStudentData(days)
          break
        case 'course':
          await chartStore.fetchCourseData(days)
          break
        case 'courseCompletion':
          await chartStore.fetchCourseCompletionData(days)
          break
        case 'categoryDistribution':
          await chartStore.fetchCategoryDistributionData()
          break
        case 'topCourses':
          await chartStore.fetchTopCoursesData()
          break
        default:
          console.warn(`Unknown chart type: ${chartType}`)
      }
      return true
    } catch (error) {
      console.error(`Error fetching ${chartType} chart:`, error)
      return false
    }
  }
  
  // Get loading state for a specific chart
  const getLoadingState = (chartType) => {
    // Map old chart types to new ones for backward compatibility
    const typeMap = {
      'enrollment': 'student',
      'userRegistration': 'course'
    }
    const mappedType = typeMap[chartType] || chartType
    return chartStore.loading[mappedType] || false
  }

  // Get error state for a specific chart
  const getErrorState = (chartType) => {
    // Map old chart types to new ones for backward compatibility
    const typeMap = {
      'enrollment': 'student',
      'userRegistration': 'course'
    }
    const mappedType = typeMap[chartType] || chartType
    return chartStore.error[mappedType] || null
  }
  
  // Fetch data initially if autoFetch is true
  if (autoFetch) {
    fetchChartData()
  }
  
  // Add this function to generate theme-consistent colors
  const generateChartColors = (count) => {
    const baseColors = [
      'rgba(5, 184, 58, 0.8)',    // Primary accent (green)
      'rgba(64, 145, 247, 0.8)',  // Blue
      'rgba(255, 159, 64, 0.8)',  // Orange
      'rgba(255, 99, 132, 0.8)',  // Red
      'rgba(153, 102, 255, 0.8)', // Purple
      'rgba(255, 206, 86, 0.8)',  // Yellow
      'rgba(75, 192, 192, 0.8)',  // Cyan
      'rgba(153, 102, 255, 0.8)', // Purple
      'rgba(255, 159, 64, 0.8)',  // Orange
      'rgba(255, 99, 132, 0.8)',  // Red
    ]
    return baseColors.slice(0, count)
  }

  return {
    // Data
    isLoading,
    hasError,
    revenueData,
    studentData,
    courseData,
    courseCompletionData,
    categoryDistributionData,
    topCoursesData,

    // Stats
    revenueStats,
    studentStats,
    courseStats,

    // Methods
    updateTimeRange,
    fetchChartData,
    fetchSpecificChart,
    getLoadingState,
    getErrorState,
    generateChartColors,

    // Backward compatibility
    enrollmentData: studentData,
    userRegistrationData: courseData
  }
}


