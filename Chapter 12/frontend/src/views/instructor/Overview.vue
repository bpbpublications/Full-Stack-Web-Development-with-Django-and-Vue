<template>
  <div class="overview">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-users"></i>
          <h3>Total Students</h3>
        </div>
        <p class="stat-value">{{ stats.totalStudents }}</p>
        <p class="stat-change">+{{ stats.newStudents }} this month</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-book"></i>
          <h3>Active Courses</h3>
        </div>
        <p class="stat-value">{{ stats.activeCourses }}</p>
        <p class="stat-change">{{ stats.draftCourses }} drafts</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-dollar-sign"></i>
          <h3>Total Earnings</h3>
        </div>
        <p class="stat-value">${{ stats.totalEarnings }}</p>
        <p class="stat-change">+${{ stats.monthlyEarnings }} this month</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-star"></i>
          <h3>Average Rating</h3>
        </div>
        <p class="stat-value">{{ stats.averageRating }}/5.0</p>
        <p class="stat-change">{{ stats.totalReviews }} reviews</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card recent-activity">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <i :class="activity.icon"></i>
            <div class="activity-content">
              <p>{{ activity.description }}</p>
              <span class="activity-date">{{ formatDate(activity.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card course-performance">
        <h3>Course Performance</h3>
        <div class="course-list">
          <div v-for="course in topCourses" :key="course.id" class="course-item">
            <img :src="course.image" :alt="course.name" class="course-thumbnail">
            <div class="course-info">
              <h4>{{ course.name }}</h4>
              <div class="course-stats">
                <span><i class="fas fa-users"></i> {{ course.students }}</span>
                <span><i class="fas fa-star"></i> {{ course.rating }}</span>
                <span><i class="fas fa-dollar-sign"></i> {{ course.earnings }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref({
  totalStudents: 1250,
  newStudents: 48,
  activeCourses: 5,
  draftCourses: 2,
  totalEarnings: 12500,
  monthlyEarnings: 2300,
  averageRating: 4.8,
  totalReviews: 156
})

const recentActivity = ref([
  {
    id: 1,
    icon: 'fas fa-user-plus',
    description: 'New enrollment in "Advanced Data Science"',
    date: '2023-06-15'
  },
  {
    id: 2,
    icon: 'fas fa-star',
    description: 'New 5-star review on "Web Development Fundamentals"',
    date: '2023-06-14'
  },
  {
    id: 3,
    icon: 'fas fa-comment',
    description: 'New question in "Python Basics" discussion forum',
    date: '2023-06-14'
  }
])

const topCourses = ref([
  {
    id: 1,
    name: 'Advanced Data Science',
    image: '/course1.jpg',
    students: 450,
    rating: 4.9,
    earnings: 5600
  },
  {
    id: 2,
    name: 'Web Development Fundamentals',
    image: '/course2.jpg',
    students: 380,
    rating: 4.7,
    earnings: 4200
  }
])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.overview {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
}

.stat-change {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--tertiary-black);
  border-radius: 8px;
}

.activity-content {
  flex: 1;
}

.activity-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--tertiary-black);
  border-radius: 8px;
}

.course-thumbnail {
  width: 100px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.course-info {
  flex: 1;
}

.course-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
