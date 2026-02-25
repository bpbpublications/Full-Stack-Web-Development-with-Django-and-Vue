<template>
  <div class="progress-dashboard">
    <h1>Learning Progress</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Courses Completed</h3>
        <div class="stat-value">{{ stats.completedCourses }}</div>
        <div class="stat-label">out of {{ stats.totalCourses }} courses</div>
      </div>
      
      <div class="stat-card">
        <h3>Total Learning Hours</h3>
        <div class="stat-value">{{ stats.learningHours }}</div>
        <div class="stat-label">hours</div>
      </div>
      
      <div class="stat-card">
        <h3>Certificates Earned</h3>
        <div class="stat-value">{{ stats.certificatesEarned }}</div>
      </div>
    </div>

    <div class="recent-activity card">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref({
  completedCourses: 2,
  totalCourses: 5,
  learningHours: 45,
  certificatesEarned: 2
})

const recentActivities = ref([
  {
    id: 1,
    icon: 'fas fa-check-circle',
    title: 'Completed lesson: Introduction to Python',
    time: '2 hours ago'
  },
  {
    id: 2,
    icon: 'fas fa-play-circle',
    title: 'Started: Advanced Data Analysis',
    time: '1 day ago'
  },
  {
    id: 3,
    icon: 'fas fa-certificate',
    title: 'Earned certificate: Web Development Fundamentals',
    time: '2 days ago'
  }
])
</script>

<style scoped>
.progress-dashboard {
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
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent-color);
  margin: 1rem 0;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.activity-list {
  margin-top: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: var(--tertiary-black);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--accent-color);
}

.activity-content {
  flex: 1;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
</style>