<template>
  <div class="dashboard-overview">
    <h1>Dashboard</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-graduation-cap"></i>
          <h3>Enrolled Courses</h3>
        </div>
        <p class="stat-value">{{ stats.enrolledCourses }}</p>
        <p class="stat-change">{{ stats.activeCourses }} in progress</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-certificate"></i>
          <h3>Certificates</h3>
        </div>
        <p class="stat-value">{{ stats.certificates }}</p>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-clock"></i>
          <h3>Learning Hours</h3>
        </div>
        <p class="stat-value">{{ stats.learningHours }}</p>
        <p class="stat-change">Last 30 days</p>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="section recent-courses">
        <h2>Continue Learning</h2>
        <div class="courses-grid">
          <div v-for="course in recentCourses" :key="course.id" class="course-card">
            <img :src="course.thumbnail" :alt="course.title" class="course-thumbnail">
            <div class="course-content">
              <h3>{{ course.title }}</h3>
              <div class="progress-bar">
                <div class="progress" :style="{ width: `${course.progress}%` }"></div>
              </div>
              <div class="progress-text">{{ course.progress }}% Complete</div>
              <router-link 
                :to="{ name: 'CourseDetails', params: { id: course.id }}" 
                class="continue-btn"
              >
                Continue Learning
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="section recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.description }}</div>
              <div class="activity-time">{{ activity.date }}</div>
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
  enrolledCourses: 5,
  activeCourses: 3,
  certificates: 2,
  learningHours: 45
})

const recentCourses = ref([
  {
    id: 1,
    title: 'Introduction to Python Programming',
    thumbnail: '/course-thumbnails/python.jpg',
    progress: 65
  },
  {
    id: 2,
    title: 'Web Development Fundamentals',
    thumbnail: '/course-thumbnails/web-dev.jpg',
    progress: 30
  }
])

const recentActivity = ref([
  {
    id: 1,
    icon: 'fas fa-play-circle',
    description: 'Resumed "Advanced Data Analysis"',
    date: '2 hours ago'
  },
  {
    id: 2,
    icon: 'fas fa-check-circle',
    description: 'Completed Chapter 3 in "Python Programming"',
    date: '1 day ago'
  },
  {
    id: 3,
    icon: 'fas fa-certificate',
    description: 'Earned certificate in "Web Development"',
    date: '3 days ago'
  }
])
</script>

<style scoped>
.dashboard-overview {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-header i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0.5rem 0;
}

.stat-change {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dashboard-sections {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

.section {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.course-card {
  background: var(--tertiary-black);
  border-radius: 8px;
  overflow: hidden;
}

.course-thumbnail {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-content {
  padding: 1rem;
}

.progress-bar {
  background: var(--primary-black);
  height: 8px;
  border-radius: 4px;
  margin: 1rem 0;
}

.progress {
  background: var(--accent-color);
  height: 100%;
  border-radius: 4px;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.continue-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: var(--primary-black);
  text-decoration: none;
  border-radius: 4px;
  transition: opacity 0.3s ease;
}

.continue-btn:hover {
  opacity: 0.9;
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
  background: var(--accent-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-black);
}

.activity-content {
  flex: 1;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .dashboard-overview {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>