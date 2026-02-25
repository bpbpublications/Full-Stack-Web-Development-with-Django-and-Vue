<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileOpen }">
    <div class="sidebar-header">
      <div class="logo" v-if="!isCollapsed">
        <h2>DP Dashboard</h2>
      </div>
      <button class="toggle-btn" @click="toggleSidebar">
        <i :class="isCollapsed ? 'fas fa-bars' : 'fas fa-times'"></i>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <!-- Home/Dashboard -->
      <router-link 
        :to="userStore.defaultRedirectPath" 
        class="nav-item"
        :class="{ 'collapsed': isCollapsed }"
      >
        <i class="fas fa-tachometer-alt"></i>
        <span v-if="!isCollapsed">Dashboard</span>
      </router-link>

      <!-- Admin Navigation -->
      <template v-if="userStore.isAdmin">
        <router-link to="/admin/students" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-users"></i>
          <span v-if="!isCollapsed">Students</span>
        </router-link>
        <router-link to="/admin/instructors" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-chalkboard-teacher"></i>
          <span v-if="!isCollapsed">Instructors</span>
        </router-link>
        <router-link to="/admin/courses" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-book"></i>
          <span v-if="!isCollapsed">Courses</span>
        </router-link>
        <router-link to="/admin/reports" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-chart-bar"></i>
          <span v-if="!isCollapsed">Reports</span>
        </router-link>
        <router-link to="/admin/settings" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-cog"></i>
          <span v-if="!isCollapsed">Settings</span>
        </router-link>
      </template>

      <!-- Instructor Navigation -->
      <template v-if="userStore.isInstructor">
        <router-link to="/instructor/courses" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-book"></i>
          <span v-if="!isCollapsed">My Courses</span>
        </router-link>
        <router-link to="/instructor/students" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-users"></i>
          <span v-if="!isCollapsed">Students</span>
        </router-link>
        <router-link to="/instructor/earnings" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-dollar-sign"></i>
          <span v-if="!isCollapsed">Earnings</span>
        </router-link>
      </template>

      <!-- Student Navigation -->
      <template v-if="userStore.isStudent">
        <router-link to="/dashboard/my-courses" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-graduation-cap"></i>
          <span v-if="!isCollapsed">My Courses</span>
        </router-link>
        <router-link to="/dashboard/progress" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-chart-line"></i>
          <span v-if="!isCollapsed">Progress</span>
        </router-link>
        <router-link to="/dashboard/certificates" class="nav-item" :class="{ 'collapsed': isCollapsed }">
          <i class="fas fa-certificate"></i>
          <span v-if="!isCollapsed">Certificates</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()
const isCollapsed = ref(false)
const isMobileOpen = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleMobileSidebar = () => {
  isMobileOpen.value = !isMobileOpen.value
}

// Expose methods for parent components
defineExpose({
  toggleMobileSidebar
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 72px;
  height: calc(100vh - 72px);
  width: 250px;
  background: var(--secondary-bg);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  z-index: 100;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.logo h2 {
  margin: 0;
  color: var(--accent-color);
  font-size: 1.2rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.toggle-btn:hover {
  background-color: var(--hover-bg);
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0.25rem 0.5rem;
  border-radius: 6px;
}

.nav-item.collapsed {
  justify-content: center;
  padding: 0.75rem;
}

.nav-item i {
  width: 20px;
  text-align: center;
  margin-right: 12px;
}

.nav-item.collapsed i {
  margin-right: 0;
}

.nav-item:hover {
  background-color: var(--hover-bg);
}

.nav-item.router-link-active {
  background-color: var(--accent-color);
  color: var(--primary-bg);
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>
