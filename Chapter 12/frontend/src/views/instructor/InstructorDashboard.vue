<template>
  <div class="dashboard-container">
    <aside class="dashboard-sidebar">
      <div class="user-info">
        <img
          :src="getAvatarUrl(instructor.avatar)"
          :alt="`${instructor.name} avatar`"
          class="user-avatar"
          @error="handleImageError"
        />
        <h3>{{ instructor.name }}</h3>
        <p>{{ instructor.email }}</p>
      </div>
      <nav class="dashboard-nav">
        <router-link to="/instructor/overview" class="nav-item" active-class="active">
          <i class="fas fa-chart-line"></i> Overview
        </router-link>
        <router-link to="/instructor/courses" class="nav-item" active-class="active">
          <i class="fas fa-book"></i> My Courses
        </router-link>
        <router-link to="/instructor/students" class="nav-item" active-class="active">
          <i class="fas fa-users"></i> Students
        </router-link>
        <router-link to="/instructor/earnings" class="nav-item" active-class="active">
          <i class="fas fa-dollar-sign"></i> Earnings
        </router-link>
        <router-link to="/instructor/reviews" class="nav-item" active-class="active">
          <i class="fas fa-star"></i> Reviews
        </router-link>
        <router-link to="/instructor/notifications" class="nav-item" active-class="active">
          <i class="fas fa-bell"></i> Notifications
        </router-link>
      </nav>
    </aside>

    <main class="dashboard-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useDashboardStore } from '../../stores/dashboardStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const dashboardStore = useDashboardStore()
const router = useRouter()

const instructor = computed(() => ({
  name: userStore.getUserProfile.name || 'Instructor',
  email: userStore.getUserProfile.email || '',
  avatar: userStore.getUserProfile.avatar,
}))

const getAvatarUrl = (avatar) => {
  if (avatar) {
    if (avatar.startsWith('http')) {
      return avatar
    }
    if (avatar.startsWith('/')) {
      return `http://127.0.0.1:8000${avatar}`
    }
    return `http://127.0.0.1:8000/media/avatars/${avatar}`
  }
  return '/src/assets/default-instructor-avatar.svg'
}

const handleImageError = (event) => {
  event.target.src = '/src/assets/default-instructor-avatar.svg'
}

onMounted(async () => {
  try {
    if (!userStore.isInstructor) {
      console.warn('Non-instructor user accessing instructor dashboard')
      router.push('/login')
      return
    }

    console.log('InstructorDashboard mounted')
    console.log('Instructor authenticated:', userStore.isAuthenticated)
    console.log('Instructor data:', instructor.value)

    console.log('Setting up WebSocket for instructor notifications')
    notificationStore.setupWebSocket()

    await Promise.all([
      dashboardStore.fetchAllAnalytics(),
      dashboardStore.fetchTopCourses(10),
      dashboardStore.fetchActiveUsers()
    ])

    console.log('Instructor dashboard data loaded successfully')
  } catch (error) {
    console.error('Error during InstructorDashboard initialization:', error)
  }
})

onUnmounted(() => {
  console.log('InstructorDashboard unmounted, cleaning up')
  notificationStore.cleanupWebSocket()
})
</script>

<style scoped>
.dashboard-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: calc(100vh - 72px); /* Match header height */
  background: var(--primary-black);
  position: relative;
  overflow: hidden;
}

.dashboard-sidebar {
  background: var(--secondary-black);
  border-right: 1px solid var(--tertiary-black);
  padding: 2rem; /* Restored to original 2rem */
}

.user-info {
  text-align: center;
  margin-bottom: 2rem; /* Restored to original 2rem */
  padding-bottom: 2rem; /* Restored to original 2rem */
  border-bottom: 1px solid var(--tertiary-black);
}

.user-avatar {
  width: 100px; /* Restored to original 100px */
  height: 100px; /* Restored to original 100px */
  border-radius: 50%;
  margin-bottom: 1rem; /* Restored to original 1rem */
  object-fit: cover;
  border: 2px solid var(--accent-color);
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Restored to original 0.5rem */
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem; /* Restored to original 1rem */
  padding: 1rem; /* Restored to original 1rem */
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px; /* Restored to original 8px */
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item i {
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-item:hover {
  background: var(--tertiary-black);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-color);
  color: var(--primary-black);
}

.nav-item.active i {
  color: var(--primary-black);
}

.dashboard-content {
  padding: 0; /* Remove default padding to let child components control their own spacing */
  overflow-y: auto;
  background: var(--primary-black);
  position: relative;
}

/* Enhanced responsive design */
@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .dashboard-sidebar {
    display: block;
    padding: 1rem;
    border-right: none;
    border-bottom: 1px solid var(--tertiary-black);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
    margin-bottom: 0;
  }

  .dashboard-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.25rem;
    padding-bottom: 0.5rem;
  }

  .nav-item {
    padding: 0.75rem;
    white-space: nowrap;
    min-width: auto;
    flex-shrink: 0;
  }

  .dashboard-content {
    padding: 0; /* Let child components handle their own padding */
  }
}

@media (max-width: 480px) {
  .nav-item span {
    display: none;
  }

  .nav-item {
    padding: 0.75rem 0.5rem;
    justify-content: center;
  }
}
</style>
