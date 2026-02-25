import { defineStore } from 'pinia';
import apiClient from '../services/apiClient';
import { dashboardService } from '../services/dashboardService';
import { useUserStore } from './userStore';

/**
 * Pinia store for dashboard statistics and analytics
 * Manages dashboard data with caching, loading states, and error handling
 */
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      totalStudents: 0,
      newStudents: 0,
      activeCourses: 0,
      totalInstructors: 0,
      totalRevenue: 0,
      courseCompletions: 0,
      avgProgress: 0
    },
    studentAnalytics: null,
    courseAnalytics: null,
    revenueAnalytics: null,
    completionBreakdown: null,
    topCourses: null,
    categoryDistribution: null,
    isLoading: false,
    isLoadingStats: false,
    isLoadingStudents: false,
    isLoadingCourses: false,
    isLoadingRevenue: false,
    isLoadingCompletion: false,
    isLoadingTopCourses: false,
    isLoadingCategories: false,
    error: null,
    errors: {
      stats: null,
      students: null,
      courses: null,
      revenue: null,
      completion: null,
      topCourses: null,
      categories: null
    },
    lastUpdated: {
      stats: null,
      students: null,
      courses: null,
      revenue: null,
      completion: null,
      topCourses: null,
      categories: null
    },
    activeUsers: 0,
    assignments: [],
    recentActivity: [],
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    isConnected: false,
    connectionStatus: 'disconnected',
    reconnectAttempts: 0,
    isLoadingAssignments: false
  }),

  getters: {
    hasStats: (state) => state.stats && state.stats.totalStudents > 0,
    
    revenueFormatted: (state) => {
      const revenue = state.stats.totalRevenue;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(revenue);
    },

    completionPercentage: (state) => {
      const completion = state.stats.avgProgress;
      return typeof completion === 'number' ? Math.round(completion) : 0;
    },

    studentGrowth: (state) => ({
      total: state.stats.totalStudents,
      new: state.stats.newStudents,
      growthRate: state.stats.totalStudents > 0 
        ? ((state.stats.newStudents / state.stats.totalStudents) * 100).toFixed(1)
        : 0
    }),

    dashboardIsLoading: (state) => state.isLoading || state.isLoadingStats,

    allAnalyticsReady: (state) => 
      state.studentAnalytics !== null &&
      state.courseAnalytics !== null &&
      state.revenueAnalytics !== null,

    hasErrors: (state) => Object.values(state.errors).some(error => error !== null)
  },

  actions: {
    async fetchDashboardStats() {
      this.isLoadingStats = true;
      this.errors.stats = null;

      try {
        this.stats = await dashboardService.getDashboardStats();
        this.lastUpdated.stats = new Date().toISOString();
        console.log('Dashboard stats fetched successfully');
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        this.errors.stats = error.message || 'Failed to load dashboard statistics';
        this.error = this.errors.stats;
      } finally {
        this.isLoadingStats = false;
      }
    },

    async fetchStudentAnalytics(days = 30) {
      this.isLoadingStudents = true;
      this.errors.students = null;

      try {
        this.studentAnalytics = await dashboardService.getStudentAnalytics(days);
        this.lastUpdated.students = new Date().toISOString();
        console.log(`Student analytics fetched (${days} days)`);
      } catch (error) {
        console.error('Failed to fetch student analytics:', error);
        this.errors.students = error.message || 'Failed to load student analytics';
        this.error = this.errors.students;
      } finally {
        this.isLoadingStudents = false;
      }
    },

    async fetchCourseAnalytics(days = 30) {
      this.isLoadingCourses = true;
      this.errors.courses = null;

      try {
        this.courseAnalytics = await dashboardService.getCourseAnalytics(days);
        this.lastUpdated.courses = new Date().toISOString();
        console.log(`Course analytics fetched (${days} days)`);
      } catch (error) {
        console.error('Failed to fetch course analytics:', error);
        this.errors.courses = error.message || 'Failed to load course analytics';
        this.error = this.errors.courses;
      } finally {
        this.isLoadingCourses = false;
      }
    },

    async fetchRevenueAnalytics(days = 30) {
      this.isLoadingRevenue = true;
      this.errors.revenue = null;

      try {
        this.revenueAnalytics = await dashboardService.getRevenueAnalytics(days);
        this.lastUpdated.revenue = new Date().toISOString();
        console.log(`Revenue analytics fetched (${days} days)`);
      } catch (error) {
        console.error('Failed to fetch revenue analytics:', error);
        this.errors.revenue = error.message || 'Failed to load revenue analytics';
        this.error = this.errors.revenue;
      } finally {
        this.isLoadingRevenue = false;
      }
    },

    async fetchCompletionBreakdown(days = 120) {
      this.isLoadingCompletion = true;
      this.errors.completion = null;

      try {
        this.completionBreakdown = await dashboardService.getCompletionBreakdown(days);
        this.lastUpdated.completion = new Date().toISOString();
        console.log(`Completion breakdown fetched (${days} days)`);
      } catch (error) {
        console.error('Failed to fetch completion breakdown:', error);
        this.errors.completion = error.message || 'Failed to load completion breakdown';
        this.error = this.errors.completion;
      } finally {
        this.isLoadingCompletion = false;
      }
    },

    async fetchTopCourses(limit = 10) {
      this.isLoadingTopCourses = true;
      this.errors.topCourses = null;

      try {
        this.topCourses = await dashboardService.getTopCourses(limit);
        this.lastUpdated.topCourses = new Date().toISOString();
        console.log(`Top courses fetched (limit: ${limit})`);
      } catch (error) {
        console.error('Failed to fetch top courses:', error);
        this.errors.topCourses = error.message || 'Failed to load top courses';
        this.error = this.errors.topCourses;
      } finally {
        this.isLoadingTopCourses = false;
      }
    },

    async fetchCategoryDistribution() {
      this.isLoadingCategories = true;
      this.errors.categories = null;

      try {
        this.categoryDistribution = await dashboardService.getCategoryDistribution();
        this.lastUpdated.categories = new Date().toISOString();
        console.log('Category distribution fetched');
      } catch (error) {
        console.error('Failed to fetch category distribution:', error);
        this.errors.categories = error.message || 'Failed to load category distribution';
        this.error = this.errors.categories;
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async fetchAllAnalytics() {
      this.isLoading = true;
      this.error = null;

      try {
        await Promise.all([
          this.fetchDashboardStats(),
          this.fetchStudentAnalytics(),
          this.fetchCourseAnalytics(),
          this.fetchRevenueAnalytics(),
          this.fetchCompletionBreakdown(),
          this.fetchTopCourses(),
          this.fetchCategoryDistribution()
        ]);

        console.log('All analytics fetched successfully');
      } catch (error) {
        console.error('Error fetching some analytics:', error);
        this.error = 'Failed to load some analytics';
      } finally {
        this.isLoading = false;
      }
    },

    clearCache() {
      dashboardService.clearCache();
      console.log('Dashboard cache cleared');
    },

    resetErrors() {
      this.error = null;
      this.errors = {
        stats: null,
        students: null,
        courses: null,
        revenue: null,
        completion: null,
        topCourses: null,
        categories: null
      };
    },

    resetState() {
      this.stats = {
        totalStudents: 0,
        newStudents: 0,
        activeCourses: 0,
        totalInstructors: 0,
        totalRevenue: 0,
        courseCompletions: 0,
        avgProgress: 0
      };
      this.studentAnalytics = null;
      this.courseAnalytics = null;
      this.revenueAnalytics = null;
      this.completionBreakdown = null;
      this.topCourses = null;
      categoryDistribution: null;
      this.error = null;
      this.errors = {
        stats: null,
        students: null,
        courses: null,
        revenue: null,
        completion: null,
        topCourses: null,
        categories: null
      };
      this.lastUpdated = {
        stats: null,
        students: null,
        courses: null,
        revenue: null,
        completion: null,
        topCourses: null,
        categories: null
      };
    },

    async requestDashboardUpdate() {
      console.log('Dashboard update requested');
      await this.fetchAllAnalytics();
    },

    async fetchAssignments() {
      this.isLoadingAssignments = true;
      this.errors.assignments = null;

      try {
        const studentStore = useUserStore();
        const userId = studentStore.user?.id;

        if (!userId) {
          throw new Error('User ID required to fetch assignments');
        }

        const response = await apiClient.get(`/api/assignments/student/${userId}/`);
        
        this.assignments = response.data.assignments || [];
        this.totalAssignments = this.assignments.length;
        this.completedAssignments = this.assignments.filter(a => a.status === 'Graded' || a.status === 'Completed').length;
        this.pendingAssignments = this.assignments.filter(a => a.status === 'Submitted' || a.status === 'In Progress').length;

        console.log('Assignments fetched successfully');
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        this.errors.assignments = error.message || 'Failed to load assignments';
        this.error = this.errors.assignments;
      } finally {
        this.isLoadingAssignments = false;
      }
    },

    async fetchRecentActivity() {
      try {
        const studentStore = useUserStore();
        const userId = studentStore.user?.id;

        if (!userId) {
          throw new Error('User ID required to fetch activity');
        }

        const response = await apiClient.get(`/api/activity/recent/${userId}/?limit=10`);
        
        this.recentActivity = response.data.activities || [];
        console.log('Recent activity fetched successfully');
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        this.recentActivity = [];
      }
    },

    async fetchActiveUsers() {
      try {
        const response = await apiClient.get('/api/analytics/active-users/');
        this.activeUsers = response.data.count || 0;
        console.log('Active users fetched successfully');
      } catch (error) {
        console.error('Failed to fetch active users:', error);
        this.activeUsers = 0;
      }
    }
  }
});
