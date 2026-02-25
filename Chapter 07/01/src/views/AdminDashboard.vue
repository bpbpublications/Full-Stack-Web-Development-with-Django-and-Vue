<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="admin-title">DP Dashboard</h2>
        </div>
        <div class="header-center">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input type="text" placeholder="Search..." class="search-input">
          </div>
        </div>
        <div class="header-right">
          <div class="notifications-dropdown" v-click-outside="closeNotificationsDropdown">
            <button class="notifications-btn" @click="isNotificationsOpen = !isNotificationsOpen">
              <i class="fas fa-bell"></i>
              <span class="notification-badge" v-if="unreadNotifications > 0">{{ unreadNotifications }}</span>
            </button>
            <div class="notifications-menu dropdown-menu" v-if="isNotificationsOpen">
              <div class="dropdown-header">
                <h3>Notifications</h3>
              </div>
              <div class="notifications-list">
                <div v-for="notification in notifications" :key="notification.id" 
                     :class="['notification-item', { unread: !notification.read }]">
                  <div class="notification-icon">
                    <i :class="notification.icon"></i>
                  </div>
                  <div class="notification-content">
                    <p class="notification-message">{{ notification.message }}</p>
                    <span class="notification-time">{{ notification.time }}</span>
                  </div>
                </div>
              </div>
              <div class="dropdown-footer">
                <router-link to="/admin/notifications" class="view-all">View all notifications</router-link>
              </div>
            </div>
          </div>
          <div class="profile-dropdown" v-click-outside="closeProfileDropdown">
            <button class="profile-btn" @click="isProfileOpen = !isProfileOpen">
              <img src="../../assets/default-avatar.png" alt="Avatar" class="profile-avatar">
              <span class="profile-name">{{ userStore.getUserProfile.names || 'Admin' }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu" v-if="isProfileOpen">
              <div class="dropdown-header">
                <div class="dropdown-user-info">
                  <span class="dropdown-name">{{ userStore.getUserProfile.role || 'Administrator' }}</span>
                  <span class="dropdown-email">{{ userStore.getUserProfile.email || 'admin@dp.com' }}</span>
                </div>
              </div>
              <router-link to="/admin/dashboard" class="dropdown-item">
                <i class="fas fa-tachometer-alt"></i> Admin Dashboard
              </router-link>
              <router-link to="/admin/users" class="dropdown-item">
                <i class="fas fa-users"></i> User Management
              </router-link>
              <router-link to="/admin/courses" class="dropdown-item">
                <i class="fas fa-book"></i> Course Management
              </router-link>
              <router-link to="/admin/settings" class="dropdown-item">
                <i class="fas fa-cog"></i> Settings
              </router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="logout">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="dashboard-container">
      <aside class="dashboard-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <i :class="sidebarCollapsed ? 'fas fa-bars' : 'fas fa-times'"></i>
          </button>
        </div>
        <nav class="dashboard-nav">
          <router-link to="/admin/dashboard" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-tachometer-alt"></i>
            <span v-if="!sidebarCollapsed">Dashboard</span>
          </router-link>
          <router-link to="/admin/courses" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-book"></i>
            <span v-if="!sidebarCollapsed">Courses</span>
          </router-link>
          <router-link to="/admin/students" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-users"></i>
            <span v-if="!sidebarCollapsed">Students</span>
          </router-link>
          <router-link to="/admin/instructors" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-chalkboard-teacher"></i>
            <span v-if="!sidebarCollapsed">Instructors</span>
          </router-link>
          <router-link to="/admin/reports" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-chart-bar"></i>
            <span v-if="!sidebarCollapsed">Analytics & Reports</span>
          </router-link>
          <router-link to="/admin/users" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-users"></i>
            <span v-if="!sidebarCollapsed">User Management</span>
          </router-link>
          <router-link to="/admin/settings" class="nav-item" :class="{ 'collapsed': sidebarCollapsed }">
            <i class="fas fa-cog"></i>
            <span v-if="!sidebarCollapsed">Settings</span>
          </router-link>
        </nav>
      </aside>

      <main class="dashboard-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="view-container">
          <div class="view-content">
            <router-view v-if="userStore.isAdmin"></router-view>
            <div v-else class="loading-container">
              <p>Checking permissions...</p>
            </div>
          </div>
          <div class="copyright-text">
            <p>&copy; 2026 Datapundits. All Rights Reserved.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  console.log("AdminDashboard mounted, checking admin status")
  console.log("Current user role:", userStore.user.role)
  console.log("Is admin?", userStore.isAdmin)
  if (!userStore.isAdmin) {
    console.warn("Non-admin user attempting to access admin dashboard")
    router.push('/')
  }
})

const isProfileOpen = ref(false)
const sidebarCollapsed = ref(false)

const closeProfileDropdown = () => {
  isProfileOpen.value = false
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const isNotificationsOpen = ref(false)
const unreadNotifications = ref(2)

const notifications = ref([
  {
    id: 1,
    message: 'New course submitted for review',
    time: '5 min ago',
    read: false,
    icon: 'fas fa-book'
  },
  {
    id: 2,
    message: 'New instructor application',
    time: '1 hour ago',
    read: false,
    icon: 'fas fa-user'
  },
  {
    id: 3,
    message: 'System maintenance scheduled',
    time: '2 hours ago',
    read: true,
    icon: 'fas fa-cog'
  }
])

const closeNotificationsDropdown = () => {
  isNotificationsOpen.value = false
}

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--primary-black);
  display: flex;
  flex-direction: column;
}

.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--secondary-black);
  z-index: 10000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 2rem;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 2rem;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid var(--tertiary-black);
  background: var(--tertiary-black);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.notifications-dropdown {
  position: relative;
  margin-right: 1.5rem;
}

.notifications-btn {
  position: relative;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.notifications-btn:hover {
  background-color: var(--tertiary-black);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--accent-color);
  color: var(--primary-black);
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-menu {
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1rem;
}

.mark-all-read {
  background: none;
  border: none;
  color: var(--accent-color);
  font-size: 0.8rem;
  cursor: pointer;
}

.notifications-list {
  padding: 0.5rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s ease;
}

.notification-item:hover {
  background-color: var(--tertiary-black);
}

.notification-item.unread {
  background-color: rgba(var(--accent-color-rgb), 0.1);
}

.notification-icon {
  width: 32px;
  height: 32px;
  background: var(--tertiary-black);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: var(--accent-color);
}

.notification-content {
  flex: 1;
}

.notification-message {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.notification-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.dropdown-footer {
  padding: 0.75rem;
  text-align: center;
  border-top: 1px solid var(--tertiary-black);
}

.view-all {
  color: var(--accent-color);
  text-decoration: none;
  font-size: 0.9rem;
}

/* Profile Dropdown Styles */
.profile-dropdown {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.profile-btn:hover {
  background-color: var(--tertiary-black);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--secondary-black);
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  width: 280px;
  padding: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1100; /* Increased z-index to be above other elements */
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
}

.dropdown-name {
  color: var(--text-primary);
  font-weight: 500;
}

.dropdown-email {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: var(--tertiary-black);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--tertiary-black);
  margin: 0.5rem 0;
}

/* Dashboard Layout */
.dashboard-container {
  display: flex;
  padding-top: 20px;
  flex: 1;
  align-items: flex-start; /* Ensure top alignment */
}

.dashboard-sidebar {
  background: var(--secondary-black);
  border-right: 1px solid var(--tertiary-black);
  width: 230px;
  position: fixed;
  top: 72px; /* Position below the header */
  left: 0;
  height: calc(100vh - 72px); /* Subtract header height */
  overflow-y: auto;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.dashboard-sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem;
  min-height: 60px;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.sidebar-toggle:hover {
  background-color: var(--tertiary-black);
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  align-items: stretch; /* Ensure all items stretch to full width */
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Force left alignment */
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 0.125rem 0;
  position: relative;
  min-height: 48px; /* Ensure consistent height */
  text-align: left; /* Ensure text is left-aligned */
}

.nav-item.collapsed {
  justify-content: center;
  padding: 0.875rem 0.5rem;
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

.nav-item.collapsed i {
  margin-right: 0;
  width: 20px;
}

.nav-item span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left; /* Ensure text is left-aligned */
  line-height: 1.2;
  display: block;
  width: 100%;
}

.nav-item.router-link-active {
  background: var(--accent-color);
  color: var(--primary-black);
  font-weight: 600;
}

.nav-item:hover:not(.router-link-active) {
  background: var(--tertiary-black);
  transform: translateX(2px);
}

.nav-item.collapsed:hover:not(.router-link-active) {
  transform: none;
}

.view-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.dashboard-main {
  flex: 1;
  margin-left: 230px; /* Match sidebar width */
  min-height: calc(100vh - 72px); /* Subtract header height */
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.dashboard-main.sidebar-collapsed {
  margin-left: 70px; /* Match collapsed sidebar width */
}

.copyright-text {
  background-color: var(--secondary-black);
  border-top: 1px solid var(--tertiary-black);
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}

.copyright-text p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .dashboard-container {
    flex-direction: column;
    padding-top: 0;
  }

  .dashboard-sidebar {
    position: static;
    width: 100%;
    height: auto;
    top: 0;
    padding: 0.75rem;
    border-right: none;
    border-bottom: 1px solid var(--tertiary-black);
    order: 1;
  }

  .sidebar-header {
    display: none; /* Hide toggle button on mobile */
  }

  .dashboard-nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
    padding: 0;
  }

  .dashboard-main {
    margin-left: 0;
    width: 100%;
    order: 2;
    padding-top: 0;
  }

  .view-content {
    padding: 1rem;
  }

  .nav-item {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 0.75rem 0.25rem;
    min-height: 70px;
    border-radius: 6px;
  }

  .nav-item i {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    width: auto;
  }

  .nav-item span {
    font-size: 0.75rem;
    line-height: 1.2;
    margin: 0;
  }

  /* Force sidebar to always be expanded on mobile */
  .dashboard-sidebar.collapsed {
    width: 100%;
  }

  .nav-item.collapsed {
    flex-direction: column;
    padding: 0.75rem 0.25rem;
  }

  .nav-item.collapsed i {
    margin: 0 0 0.25rem 0;
  }
}

/* For very small screens */
@media (max-width: 480px) {
  .dashboard-nav {
    justify-content: center;
  }
  
  .nav-item {
    min-width: 80px;
    padding: 0.5rem;
  }
  
  .nav-item span {
    font-size: 0.7rem;
  }
}

/* Mobile responsiveness for header */
@media (max-width: 768px) {
  .admin-header {
    position: relative; /* Change from fixed to relative on mobile */
  }

  .header-content {
    flex-wrap: nowrap;
    padding: 0.75rem 1rem;
    justify-content: space-between;
  }

  .header-center {
    flex: 1;
    max-width: 200px;
    padding: 0 1rem;
    order: 2;
  }

  .header-left {
    order: 1;
    flex-shrink: 0;
  }

  .header-right {
    order: 3;
    flex-shrink: 0;
  }

  .profile-name {
    display: none;
  }

  .search-input {
    font-size: 0.875rem;
    padding: 0.5rem 1rem 0.5rem 2rem;
  }

  .admin-title {
    font-size: 1.25rem;
  }
}
</style>





























