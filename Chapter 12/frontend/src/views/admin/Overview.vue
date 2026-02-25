<template>
  <div class="admin-overview">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-users"></i>
          <h3>Students</h3>
        </div>
        <p class="stat-value">{{ statsData.totalUsers }}</p>
        <p class="stat-change">+{{ statsData.newUsers }} this month</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-graduation-cap"></i>
          <h3>Active Courses</h3>
        </div>
        <p class="stat-value">{{ statsData.activeCourses }}</p>
        <p class="stat-change">{{ statsData.pendingCourses }} pending review</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-chalkboard-teacher"></i>
          <h3>Instructors</h3>
        </div>
        <p class="stat-value">{{ statsData.totalInstructors }}</p>
        <p class="stat-change">{{ statsData.activeInstructors }} active</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-dollar-sign"></i>
          <h3>Revenue</h3>
        </div>
        <p class="stat-value">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(statsData.totalRevenue) }}</p>
        <p class="stat-change">This month</p>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="section recent-activities">
        <div class="section-header">
          <h2>Recent Activities</h2>
          <button class="view-all-btn">View All</button>
        </div>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
            <div class="activity-action">
              <button class="action-btn" v-if="activity.requiresAction">
                Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="section pending-items">
        <div class="section-header">
          <h2>Pending Reviews</h2>
          <button class="view-all-btn">View All</button>
        </div>
        <div class="pending-list">
          <div v-for="item in pendingItems" :key="item.id" class="pending-item">
            <div class="item-info">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <span class="item-meta">Submitted by {{ item.author }} • {{ item.date }}</span>
            </div>
            <div class="item-actions">
              <button class="approve-btn">Approve</button>
              <button class="reject-btn">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboardStore'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()

const dashboardStore = useDashboardStore()

const {
  stats,
  studentAnalytics,
  courseAnalytics,
  topCourses,
  completionBreakdown,
  isLoading,
  isLoadingStats,
  isLoadingTopCourses,
  isLoadingCompletion,
  error,
  errors
} = storeToRefs(dashboardStore)

const recentActivities = computed(() => {
  if (!topCourses.value?.courses) return []
  
  return topCourses.value.courses.slice(0, 5).map((course, index) => ({
    id: course.id,
    icon: 'fas fa-graduation-cap',
    text: `${course.enrollments || 0} students enrolled in "${course.title}"`,
    time: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
    requiresAction: false
  }))
})

const pendingItems = computed(() => {
  if (!completionBreakdown.value?.completion) return []
  
  const completion = completionBreakdown.value.completion
  const items = []

  if (completion.inProgress > 0) {
    items.push({
      id: 1,
      title: 'Courses in Progress',
      description: `${completion.inProgress} students have courses currently in progress`,
      author: 'System',
      date: new Date().toLocaleDateString(),
      icon: 'fas fa-hourglass-half'
    })
  }

  if (completion.notStarted > 0) {
    items.push({
      id: 2,
      title: 'Not Started Courses',
      description: `${completion.notStarted} students have not started their courses yet`,
      author: 'System',
      date: new Date().toLocaleDateString(),
      icon: 'fas fa-exclamation-circle'
    })
  }

  return items
})

const statsData = computed(() => ({
  totalUsers: stats.value.totalStudents,
  newUsers: stats.value.newStudents,
  activeCourses: stats.value.activeCourses,
  pendingCourses: pendingItems.value.length,
  totalInstructors: stats.value.totalInstructors,
  activeInstructors: stats.value.totalInstructors,
  totalRevenue: stats.value.totalRevenue
}))

const loading = computed(() => isLoading.value || isLoadingStats.value)

onMounted(async () => {
  try {
    await dashboardStore.fetchAllAnalytics()
    
    if (!error.value) {
      showToast('Dashboard data loaded successfully', 'success')
    } else {
      showToast(error.value, 'warning')
    }
  } catch (err) {
    console.error('Failed to load dashboard:', err)
    showToast('Failed to load dashboard data', 'error')
  }
})
</script>

<style scoped>
.admin-overview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  margin-top: 5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-header i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-change {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.section {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--tertiary-black);
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-content {
  flex: 1;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pending-item {
  padding: 1rem;
  background: var(--tertiary-black);
  border-radius: 8px;
}

.item-info h4 {
  margin-bottom: 0.5rem;
}

.item-meta {
  display: block;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.approve-btn,
.reject-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.approve-btn {
  background: var(--accent-color);
  color: white;
}

.reject-btn {
  background: var(--error-color);
  color: white;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
