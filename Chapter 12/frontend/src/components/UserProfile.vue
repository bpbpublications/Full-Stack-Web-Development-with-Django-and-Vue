<template>
  <div class="profile-container">
    <div class="profile-header card">
      <div class="profile-avatar">
        <img :src="user.avatar || '/default-avatar.png'" alt="User avatar">
        <button class="change-avatar-btn">
          <i class="fas fa-camera"></i>
        </button>
      </div>
      <div class="profile-info">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <p class="joined-date">Member since {{ formatDate(user.joinedDate) }}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card card">
        <i class="fas fa-book-open"></i>
        <h3>{{ stats.enrolledCourses }}</h3>
        <p>Enrolled Courses</p>
      </div>
      <div class="stat-card card">
        <i class="fas fa-check-circle"></i>
        <h3>{{ stats.completedCourses }}</h3>
        <p>Completed Courses</p>
      </div>
      <div class="stat-card card">
        <i class="fas fa-certificate"></i>
        <h3>{{ stats.certificates }}</h3>
        <p>Certificates</p>
      </div>
      <div class="stat-card card">
        <i class="fas fa-clock"></i>
        <h3>{{ stats.hoursSpent }}h</h3>
        <p>Hours Spent</p>
      </div>
    </div>

    <div class="profile-sections">
      <div class="section card">
        <h3>Personal Information</h3>
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="user.name" type="text" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="user.email" type="email" placeholder="Your email">
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="user.bio" placeholder="Tell us about yourself"></textarea>
          </div>
          <button type="submit" class="save-btn">Save Changes</button>
        </form>
      </div>

      <div class="section card">
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: 'Akpan Bolton',
  email: 'akpan@example.com',
  avatar: null,
  bio: '',
  joinedDate: '2023-01-15'
})

const stats = ref({
  enrolledCourses: 5,
  completedCourses: 2,
  certificates: 2,
  hoursSpent: 45
})

const recentActivity = ref([
  {
    id: 1,
    icon: 'fas fa-play-circle',
    description: 'Started "Advanced Data Science" course',
    date: '2023-06-10'
  },
  {
    id: 2,
    icon: 'fas fa-certificate',
    description: 'Earned certificate in "Python Basics"',
    date: '2023-06-08'
  },
  {
    id: 3,
    icon: 'fas fa-check-circle',
    description: 'Completed "Web Development Fundamentals"',
    date: '2023-06-05'
  }
])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const updateProfile = () => {
  // Implement profile update logic here
  console.log('Profile updated:', user.value)
}
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--tertiary-black);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  position: relative;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-color);
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--accent-color);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: var(--primary-black);
}

.profile-info h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.profile-info p {
  color: var(--text-secondary);
}

.joined-date {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
}

.stat-card i {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.stat-card h3 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: var(--text-secondary);
}

.profile-sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  background: var(--tertiary-black);
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  color: var(--text-primary);
}

.save-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
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

.activity-item i {
  color: var(--accent-color);
}

.activity-content p {
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.activity-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .profile-sections {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
