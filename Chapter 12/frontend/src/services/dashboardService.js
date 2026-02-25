import apiClient from './apiClient'

const CACHE_TTL = 5 * 60 * 1000;
const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 2;

const cache = new Map();

export const dashboardService = {
  validateDaysParameter(days) {
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new Error('Days parameter must be an integer between 1 and 365');
    }
    return days;
  },

  validateLimitParameter(limit) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('Limit parameter must be an integer between 1 and 100');
    }
    return limit;
  },

  validateResponse(data, requiredFields) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return data;
  },

  getCacheKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`;
  },

  getFromCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  },

  setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
  },

  async fetchWithRetry(endpoint, config = {}, retries = MAX_RETRIES) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await apiClient.get(endpoint, {
          ...config,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < retries && error.response?.status !== 404 && error.response?.status !== 401) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        } else {
          break;
        }
      }
    }

    throw lastError;
  },

  /**
   * Get comprehensive dashboard statistics from analytics endpoints
   * @returns {Promise<Object>} Dashboard statistics with student, course, revenue data
   */
  async getDashboardStats() {
    const cacheKey = this.getCacheKey('/api/dashboard/stats');
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [studentAnalytics, courseAnalytics, revenueAnalytics, instructorCount] = await Promise.allSettled([
        this.fetchWithRetry('/api/analytics/students/?days=30'),
        this.fetchWithRetry('/api/analytics/courses/?days=30'),
        this.fetchWithRetry('/api/analytics/revenue/?days=30'),
        this.fetchWithRetry('/api/accounts/users/?role=instructor')
      ]);

      const stats = {
        totalStudents: 0,
        newStudents: 0,
        activeCourses: 0,
        totalInstructors: 0,
        totalRevenue: 0,
        courseCompletions: 0,
        avgProgress: 0
      };

      if (studentAnalytics.status === 'fulfilled') {
        try {
          const studentData = this.validateResponse(
            studentAnalytics.value.data,
            ['stats']
          );
          stats.totalStudents = studentData.stats?.active ?? 0;
          stats.newStudents = studentData.stats?.new ?? 0;
        } catch (error) {
          console.error('Failed to process student analytics:', error);
        }
      } else {
        console.error('Student analytics request failed:', studentAnalytics.reason);
      }

      if (courseAnalytics.status === 'fulfilled') {
        try {
          const courseData = this.validateResponse(
            courseAnalytics.value.data,
            ['stats']
          );
          stats.activeCourses = courseData.stats?.totalCourses ?? 0;
          stats.courseCompletions = courseData.stats?.enrollments ?? 0;
          stats.avgProgress = courseData.stats?.completionRate ?? 0;
        } catch (error) {
          console.error('Failed to process course analytics:', error);
        }
      } else {
        console.error('Course analytics request failed:', courseAnalytics.reason);
      }

      if (revenueAnalytics.status === 'fulfilled') {
        try {
          const revenueData = this.validateResponse(
            revenueAnalytics.value.data,
            ['stats']
          );
          stats.totalRevenue = revenueData.stats?.total ?? 0;
        } catch (error) {
          console.error('Failed to process revenue analytics:', error);
        }
      } else {
        console.error('Revenue analytics request failed:', revenueAnalytics.reason);
      }

      if (instructorCount.status === 'fulfilled') {
        try {
          const instructorData = this.validateResponse(
            instructorCount.value.data,
            ['count']
          );
          stats.totalInstructors = instructorData.count ?? 0;
        } catch (error) {
          console.error('Failed to process instructor count:', error);
        }
      }

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get student analytics data
   * @param {number} days - Number of days to analyze (1-365)
   * @returns {Promise<Object>} Student analytics data
   */
  async getStudentAnalytics(days = 30) {
    try {
      days = this.validateDaysParameter(days);
      const cacheKey = this.getCacheKey('/api/analytics/students', { days });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.fetchWithRetry(`/api/analytics/students/?days=${days}`);
      const data = this.validateResponse(response.data, ['stats']);
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching student analytics (days=${days}):`, error);
      throw error;
    }
  },

  /**
   * Get course analytics data
   * @param {number} days - Number of days to analyze (1-365)
   * @returns {Promise<Object>} Course analytics data
   */
  async getCourseAnalytics(days = 30) {
    try {
      days = this.validateDaysParameter(days);
      const cacheKey = this.getCacheKey('/api/analytics/courses', { days });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.fetchWithRetry(`/api/analytics/courses/?days=${days}`);
      const data = this.validateResponse(response.data, ['stats']);
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching course analytics (days=${days}):`, error);
      throw error;
    }
  },

  /**
   * Get revenue analytics data
   * @param {number} days - Number of days to analyze (1-365)
   * @returns {Promise<Object>} Revenue analytics data
   */
  async getRevenueAnalytics(days = 30) {
    try {
      days = this.validateDaysParameter(days);
      const cacheKey = this.getCacheKey('/api/analytics/revenue', { days });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.fetchWithRetry(`/api/analytics/revenue/?days=${days}`);
      const data = this.validateResponse(response.data, ['stats']);
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching revenue analytics (days=${days}):`, error);
      throw error;
    }
  },

  /**
   * Get course completion breakdown
   * @param {number} days - Number of days to analyze (1-365)
   * @returns {Promise<Object>} Completion breakdown data
   */
  async getCompletionBreakdown(days = 120) {
    try {
      days = this.validateDaysParameter(days);
      const cacheKey = this.getCacheKey('/api/analytics/completion', { days });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.fetchWithRetry(`/api/analytics/completion/?days=${days}`);
      const data = this.validateResponse(response.data, ['completion']);
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching completion breakdown (days=${days}):`, error);
      throw error;
    }
  },

  /**
   * Get top performing courses
   * @param {number} limit - Maximum number of courses to return (1-100)
   * @returns {Promise<Object>} Top courses data
   */
  async getTopCourses(limit = 10) {
    try {
      limit = this.validateLimitParameter(limit);
      const cacheKey = this.getCacheKey('/api/analytics/top-courses', { limit });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.fetchWithRetry(`/api/analytics/top-courses/?limit=${limit}`);
      const data = this.validateResponse(response.data, ['courses']);
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching top courses (limit=${limit}):`, error);
      throw error;
    }
  },

  /**
   * Get course category distribution
   * @returns {Promise<Object>} Category distribution data
   */
  async getCategoryDistribution() {
    try {
      const cacheKey = this.getCacheKey('/api/analytics/categories');
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.fetchWithRetry('/api/analytics/categories/');
      const data = this.validateResponse(response.data, ['categories']);
      
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  }
}
