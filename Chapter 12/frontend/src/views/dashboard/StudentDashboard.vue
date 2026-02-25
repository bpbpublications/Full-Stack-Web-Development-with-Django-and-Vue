<template>
  <div class="dashboard-container">
    <aside class="dashboard-sidebar">
      <div class="user-info">
        <img
          :src="getAvatarUrl(user.avatar)"
          :alt="`${user.name} avatar`"
          class="user-avatar"
          @error="handleImageError"
          @load="handleImageLoad"
        >
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
      </div>
      <nav class="dashboard-nav">
        <router-link to="/dashboard/" class="nav-item" active-class="active">
          <i class="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/dashboard/profile" class="nav-item" active-class="active">
          <i class="fas fa-user"></i>
          <span>Profile</span>
        </router-link>
        <router-link to="/dashboard/my-courses" class="nav-item" active-class="active">
          <i class="fas fa-graduation-cap"></i>
          <span>My Courses</span>
        </router-link>
        <router-link to="/dashboard/progress" class="nav-item" active-class="active">
          <i class="fas fa-chart-line"></i>
          <span>Progress</span>
        </router-link>
        <router-link to="/dashboard/notifications" class="nav-item" active-class="active">
          <i class="fas fa-bell"></i>
          <span>Notifications</span>
        </router-link>
        <router-link to="/dashboard/orders" class="nav-item" active-class="active">
          <i class="fas fa-shopping-cart"></i>
          <span>Orders</span>
        </router-link>
      </nav>
    </aside>

    <main class="dashboard-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, onErrorCaptured } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useDashboardStore } from '../../stores/dashboardStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const dashboardStore = useDashboardStore()
const router = useRouter()

const user = computed(() => {
  const profile = userStore.getUserProfile || {}
  return {
    name: profile.name || profile.username || 'Student',
    email: profile.email || 'No email provided',
    avatar: profile.avatar || null
  }
})

const getAvatarUrl = (avatar) => {
  if (avatar) {
    if (avatar.startsWith('http')) {
      return avatar
    }
    if (avatar.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
      return `${baseUrl}${avatar}`
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    return `${baseUrl}/media/avatars/${avatar}`
  }
  return '/default-avatar.svg'
}

const handleImageError = (event) => {
  console.log('Avatar image failed to load, using default')
  event.target.src = '/default-avatar.svg'
}

const handleImageLoad = () => {
  console.log('Avatar image loaded successfully')
}

onErrorCaptured((error) => {
  console.error('Error in StudentDashboard:', error)
  return false
})

onMounted(async () => {
  try {
    if (!userStore.isAuthenticated) {
      await userStore.initializeAuth()
    }

    if (!userStore.isAuthenticated) {
      console.warn('User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    console.log('StudentDashboard mounted')
    console.log('User authenticated:', userStore.isAuthenticated)
    console.log('User role:', userStore.user.role)
    console.log('User data:', user.value)

    if (userStore.isAuthenticated && !userStore.isStudent) {
      console.warn('Non-student user accessing student dashboard:', userStore.user.role)
    }

    console.log('Setting up WebSocket for student notifications')
    notificationStore.setupWebSocket()

    await Promise.all([
      dashboardStore.fetchAssignments(),
      dashboardStore.fetchRecentActivity(),
      dashboardStore.fetchDashboardStats()
    ])

    console.log('Student dashboard data loaded successfully')
  } catch (error) {
    console.error('Error during StudentDashboard initialization:', error)
  }
})

onUnmounted(() => {
  console.log('StudentDashboard unmounted, cleaning up')
  notificationStore.cleanupWebSocket()
})
</script>

<style scoped>
.dashboard-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: calc(100vh - 64px);
  background: var(--primary-black);
  position: relative;
}

.dashboard-sidebar {
  background: var(--secondary-black);
  border-right: 1px solid var(--tertiary-black);
  padding: 2rem; /* Restored to original 2rem */
  display: block;
  visibility: visible;
  opacity: 1;
  /* Temporary debugging - make it more visible */
  min-width: 280px;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
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
  background-color: var(--tertiary-black); /* Fallback background */
  transition: opacity 0.3s ease; /* Smooth loading transition */
}

.user-avatar:hover {
  opacity: 0.9;
}

.user-info h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem; /* Restored to original 0.5rem */
}

.user-info p {
  color: var(--text-secondary);
  font-size: 0.9rem; /* Restored to original 0.9rem */
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Restored to original 0.5rem */
  padding: 0.5rem; /* Restored to original 0.5rem */
  align-items: stretch; /* Ensure all items stretch to full width */
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Force left alignment */
  gap: 1rem; /* Restored to original 1rem */
  padding: 1rem; /* Restored to original 1rem */
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px; /* Restored to original 8px */
  transition: all 0.3s ease;
  font-weight: 500;
  text-align: left; /* Ensure text is left-aligned */
 
}

.nav-item i {
  width: 20px; /* Fixed width for icons */
  text-align: center;
  font-size: 1rem;
  margin-right: 12px; /* Consistent spacing */
  flex-shrink: 0; /* Prevent icon from shrinking */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-item span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2;
  display: block;
  width: 100%;
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
  padding: 2rem;
  overflow-y: auto;
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
    padding: 1rem;
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
