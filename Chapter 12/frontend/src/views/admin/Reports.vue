<template>
  <div class="admin-reports">
    <div class="header">
      <h1>Analytics & Reports</h1>
      <div class="refresh-button">
        <button @click="fetchChartData" class="btn-refresh">
          <i class="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>
    </div>

    <div class="reports-grid">
      <!-- Revenue Stats with Chart -->
      <div class="report-card">
        <div class="card-header">
          <h2>Revenue Overview</h2>
          <select
            v-model="timeRanges.revenue"
            @change="handleTimeRangeChange('revenue', timeRanges.revenue)"
            class="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Revenue</span>
            <span class="stat-value">{{ formatCurrency(revenueStats.total) }}</span>
            <span class="stat-change" :class="{ positive: revenueStats.growth > 0 }">
              {{ revenueStats.growth > 0 ? '+' : '' }}{{ revenueStats.growth }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Order Value</span>
            <span class="stat-value">{{ formatCurrency(revenueStats.averageOrder) }}</span>
          </div>
        </div>
        <div class="chart-wrapper">
          <BaseChart
            type="line"
            :data="revenueData"
            :loading="getLoadingState('revenue')"
            :error="getErrorState('revenue')"
            @retry="() => fetchSpecificChart('revenue')"
            height="180px"
            :options="{
              plugins: {
                legend: { display: false }
              }
            }"
          />
        </div>
      </div>

      <!-- Student Stats with Chart -->
      <div class="report-card">
        <div class="card-header">
          <h2>Student Analytics</h2>
          <select
            v-model="timeRanges.student"
            @change="handleTimeRangeChange('student', timeRanges.student)"
            class="time-range-select"
          >
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="120">Last 120 days</option>
          </select>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">New Students</span>
            <span class="stat-value">{{ formatNumber(userStats.new) }}</span>
            <span class="stat-change" :class="{ positive: userStats.growth > 0 }">
              {{ userStats.growth > 0 ? '+' : '' }}{{ userStats.growth }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active Students</span>
            <span class="stat-value">{{ formatNumber(userStats.active) }}</span>
          </div>
        </div>
        <div class="chart-wrapper">
          <BaseChart
            type="line"
            :data="studentData"
            :loading="getLoadingState('student')"
            :error="getErrorState('student')"
            @retry="() => fetchSpecificChart('student')"
            height="180px"
            :options="{
              plugins: {
                legend: { display: false }
              }
            }"
          />
        </div>
      </div>

      <!-- Course Stats with Chart -->
      <div class="report-card">
        <div class="card-header">
          <h2>Course Analytics</h2>
          <select
            v-model="timeRanges.course"
            @change="handleTimeRangeChange('course', timeRanges.course)"
            class="time-range-select"
          >
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="120">Last 120 days</option>
            <option value="180">Last 180 days</option>
          </select>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">New Enrollments</span>
            <span class="stat-value">{{ formatNumber(courseStats.enrollments) }}</span>
            <span class="stat-change" :class="{ positive: courseStats.growth > 0 }">
              {{ courseStats.growth > 0 ? '+' : '' }}{{ courseStats.growth }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completion Rate</span>
            <span class="stat-value">{{ courseStats.completionRate }}%</span>
          </div>
        </div>
        <div class="chart-wrapper">
          <BaseChart
            type="line"
            :data="courseData"
            :loading="getLoadingState('course')"
            :error="getErrorState('course')"
            @retry="() => fetchSpecificChart('course')"
            height="180px"
            :options="{
              plugins: {
                legend: { display: false }
              }
            }"
          />
        </div>
      </div>

      <!-- Category Distribution Chart -->
      <div class="report-card">
        <h2>Course Categories</h2>
        <div class="chart-wrapper">
          <BaseChart 
            type="doughnut" 
            :data="categoryDistributionData" 
            :loading="getLoadingState('categoryDistribution')"
            :error="getErrorState('categoryDistribution')"
            @retry="fetchSpecificChart('categoryDistribution')"
            height="220px"
            :options="{ 
              cutout: '70%',
              plugins: { 
                legend: { 
                  position: 'right',
                  labels: { 
                    boxWidth: 12,
                    padding: 15
                  }
                } 
              } 
            }"
          />
        </div>
      </div>

      <!-- Course Completion Chart -->
      <div class="report-card">
        <div class="card-header">
          <h2>Course Completion</h2>
          <select
            v-model="timeRanges.completion"
            @change="handleTimeRangeChange('courseCompletion', timeRanges.completion)"
            class="time-range-select"
          >
            <option value="90">Last 90 days</option>
            <option value="120">Last 120 days</option>
            <option value="180">Last 180 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <div class="chart-wrapper">
          <BaseChart
            type="pie"
            :data="courseCompletionData"
            :loading="getLoadingState('courseCompletion')"
            :error="getErrorState('courseCompletion')"
            @retry="() => fetchSpecificChart('courseCompletion')"
            height="220px"
          />
        </div>
      </div>

      <!-- Top Performing Courses Table -->
      <div class="report-card full-width">
        <div class="card-header">
          <h2>Top Performing Courses</h2>
          <button
            @click="fetchSpecificChart('topCourses')"
            class="refresh-btn"
            :disabled="getLoadingState('topCourses')"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': getLoadingState('topCourses') }"></i>
          </button>
        </div>

        <div v-if="getLoadingState('topCourses')" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading top courses...</span>
        </div>

        <div v-else-if="getErrorState('topCourses')" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ getErrorState('topCourses') }}</span>
          <button @click="fetchSpecificChart('topCourses')" class="retry-btn">Retry</button>
        </div>

        <div v-else-if="topCourses.length === 0" class="empty-state">
          <i class="fas fa-chart-bar"></i>
          <span>No course data available</span>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Instructor</th>
              <th>Enrollments</th>
              <th>Revenue</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in topCourses" :key="course.id">
              <td>{{ course.name || course.title }}</td>
              <td>{{ course.instructor || course.instructor_name }}</td>
              <td>{{ formatNumber(course.enrollments || course.enrollment_count) }}</td>
              <td>{{ formatCurrency(course.revenue || course.total_revenue) }}</td>
              <td>
                <span class="rating">
                  {{ (course.rating || course.average_rating || 0).toFixed(1) }}/5
                  <span class="stars">
                    <i v-for="star in 5" :key="star"
                       :class="star <= Math.round(course.rating || course.average_rating || 0) ? 'fas fa-star' : 'far fa-star'">
                    </i>
                  </span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { useCharts } from '../../composables/useCharts'

// Get chart data and methods from the composable
const {
  revenueData,
  studentData,
  courseData,
  courseCompletionData,
  categoryDistributionData,
  topCoursesData,
  revenueStats: liveRevenueStats,
  studentStats: liveStudentStats,
  courseStats: liveCourseStats,
  updateTimeRange,
  fetchSpecificChart,
  getLoadingState,
  getErrorState,
  fetchChartData
} = useCharts({ autoFetch: true })

// Time range selections
const timeRanges = ref({
  revenue: '30',
  student: '60',
  course: '90',
  completion: '120'
})

// Computed properties for live stats with fallbacks
const revenueStats = computed(() => {
  return liveRevenueStats.value || {
    total: '0',
    growth: 0,
    averageOrder: '0'
  }
})

const userStats = computed(() => {
  return liveStudentStats.value || {
    new: 0,
    growth: 0,
    active: 0
  }
})

const courseStats = computed(() => {
  return liveCourseStats.value || {
    enrollments: 0,
    growth: 0,
    completionRate: 0
  }
})

const topCourses = computed(() => {
  return topCoursesData.value || []
})

// Handle time range changes
const handleTimeRangeChange = async (chartType, newRange) => {
  timeRanges.value[chartType] = newRange
  await updateTimeRange(chartType, newRange)
}

// Format currency values
const formatCurrency = (value) => {
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format numbers with commas
const formatNumber = (value) => {
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('en-US').format(value)
}
</script>

<style scoped>
.admin-reports {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px; /* Exact height of admin header */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

/* Responsive positioning */
@media (min-width: 769px) {
  .admin-reports {
    margin-top: 72px; /* Fixed admin header height */
    padding-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .admin-reports {
    margin-top: 0; /* Admin header is relative on mobile */
    padding-top: 0.5rem;
  }
}

.header {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
  gap: 2rem;
}

.header h1 {
  margin: 0 !important;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.btn-refresh {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--accent-color);
  background-color: transparent;
  color: var(--accent-color);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh:hover {
  background-color: var(--accent-color);
  color: var(--primary-bg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.time-range-select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.refresh-btn {
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  color: var(--accent-color);
  background-color: var(--hover-bg);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.report-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px var(--shadow-light);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.full-width {
  grid-column: 1 / -1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-change {
  font-size: 0.9rem;
  color: #f44336;
}

.stat-change.positive {
  color: #4caf50;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table th {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background-color: rgba(0, 0, 0, 0.2);
}

.data-table td {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
}

.data-table tr:hover td {
  background-color: rgba(255, 255, 255, 0.03);
}

/* Add alternating row colors for better readability */
.data-table tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.02);
}

.chart-wrapper {
  margin-top: 1rem;
  border-top: 1px solid var(--border-light);
  padding-top: 1.2rem;
  height: auto;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--accent-color);
}

.error-state i {
  color: var(--error);
}

.retry-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background: var(--accent-color);
  color: var(--primary-bg);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.retry-btn:hover {
  opacity: 0.9;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  font-size: 0.75rem;
  color: var(--accent-color);
}

.stars .far {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    display: block;
    overflow-x: auto;
  }
}
</style>



