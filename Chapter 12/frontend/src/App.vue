<template>
  <Toast />
  <div id="app">
    <header class="header">
      <nav>
        <div class="logo">Datapundits</div>

        <!-- Mobile menu button -->
        <button class="mobile-menu-btn" @click="isMenuOpen = !isMenuOpen">
          <i :class="isMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
        </button>

        <div class="nav-container" :class="{ active: isMenuOpen }">
          <div class="nav-links">
            <router-link :to="{ name: 'Home' }" class="nav-link">Home</router-link>
            <router-link :to="{ name: 'About' }" class="nav-link">About</router-link>
            <router-link :to="{ name: 'Courses' }" class="nav-link">Courses</router-link>
            <router-link :to="{ name: 'Contact' }" class="nav-link">Contact</router-link>
            <ThemeToggle />
          </div>

          <!-- Show login button if not authenticated -->
          <div v-if="!userStore.isAuthenticated" class="auth-buttons">
            <router-link to="/login" class="btn btn-login">Login</router-link>
            <router-link to="/register" class="btn btn-register">Register</router-link>
          </div>

          <!-- Show profile dropdown if authenticated -->
          <div v-else class="auth-section">
            <!-- Notification Bell -->
            <NotificationBell />

            <div class="profile-dropdown" v-click-outside="closeDropdown">
              <button class="profile-btn" @click="isDropdownOpen = !isDropdownOpen">
                <img
                  :src="getProfileAvatarUrl(userStore.getUserProfile.avatar)"
                  alt="Profile"
                  class="profile-avatar"
                  @error="handleProfileImageError"
                />
                <span class="profile-name">{{ userStore.getUserProfile.name }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>

              <div class="dropdown-menu" v-show="isDropdownOpen">
                <div class="dropdown-header">
                  <div class="dropdown-user-info">
                    <span class="dropdown-name">{{ userStore.getUserProfile.role }}</span>
                    <span class="dropdown-email">{{ userStore.getUserProfile.email }}</span>
                  </div>
                </div>

                <!-- Student Menu Items -->
                <template v-if="userStore.isStudent">
                  <router-link to="/dashboard/profile" class="dropdown-item">
                    <i class="fas fa-user"></i> My Profile
                  </router-link>
                  <router-link to="/dashboard/my-courses" class="dropdown-item">
                    <i class="fas fa-graduation-cap"></i> My Courses
                  </router-link>
                  <router-link to="/dashboard/certificates" class="dropdown-item">
                    <i class="fas fa-certificate"></i> Certificates
                  </router-link>
                </template>

                <!-- Instructor Menu Items -->
                <template v-if="userStore.isInstructor">
                  <router-link to="/instructor/overview" class="dropdown-item">
                    <i class="fas fa-chart-line"></i> Dashboard
                  </router-link>
                  <router-link to="/instructor/courses" class="dropdown-item">
                    <i class="fas fa-book"></i> My Courses
                  </router-link>
                  <router-link to="/instructor/earnings" class="dropdown-item">
                    <i class="fas fa-dollar-sign"></i> Earnings
                  </router-link>
                </template>

                <!-- Admin Menu Items -->
                <template v-if="userStore.isAdmin">
                  <router-link to="/admin/dashboard" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Admin Dashboard
                  </router-link>
                  <router-link to="/admin/users" class="dropdown-item">
                    <i class="fas fa-users"></i> User Management
                  </router-link>
                  <router-link to="/admin/courses" class="dropdown-item">
                    <i class="fas fa-book"></i> Course Management
                  </router-link>
                </template>

                <!-- Common Menu Items -->
                <router-link to="/settings" class="dropdown-item">
                  <i class="fas fa-cog"></i> Settings
                </router-link>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item logout-btn">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <Footer v-if="!isAdminRoute" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './stores/userStore';
import { useThemeStore } from './stores/themeStore';
import { useNotificationStore } from './stores/notificationStore';
import Footer from './components/Footer.vue';
import Toast from './components/ui/Toast.vue';
import ThemeToggle from './components/ui/ThemeToggle.vue';
import NotificationBell from './components/NotificationBell.vue';

const router = useRouter();
const route = useRoute(); // Get route instance first
const userStore = useUserStore();
const themeStore = useThemeStore();
const notificationStore = useNotificationStore();
const isMenuOpen = ref(false);
const isDropdownOpen = ref(false);
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

onMounted(async () => {
  try {
    // Initialize theme first
    themeStore.initializeTheme();

    // Then initialize auth
    await userStore.initializeAuth();

    // Initialize notification system if user is authenticated
    if (userStore.isAuthenticated) {
      console.log('Initializing notification system for authenticated user');
      notificationStore.setupWebSocket();
      await notificationStore.fetchNotifications();
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    // Handle initialization error (optional)
    userStore.logout();
    if (route.meta.requiresAuth) {
      router.push('/login');
    }
  }
});

// Watch for authentication changes to setup/cleanup notifications
watch(
  () => userStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      console.log('User authenticated, setting up notifications');
      notificationStore.setupWebSocket();
      notificationStore.fetchNotifications();
    } else {
      console.log('User logged out, cleaning up notifications');
      notificationStore.cleanupWebSocket();
    }
  }
);

onUnmounted(() => {
  // Cleanup notification system when app unmounts
  notificationStore.cleanupWebSocket();
});

// Fix: Watch the route object directly
watch(route, () => {
  isMenuOpen.value = false;
});

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// Profile avatar handling methods
const getProfileAvatarUrl = (avatar) => {
  if (avatar) {
    // If avatar is a full URL, use it directly
    if (avatar.startsWith('http')) {
      return avatar;
    }
    // If avatar is a relative path, construct full URL
    if (avatar.startsWith('/')) {
      return `http://127.0.0.1:8000${avatar}`;
    }
    // If avatar is just a filename, assume it's in media folder
    return `http://127.0.0.1:8000/media/avatars/${avatar}`;
  }
  // Default avatar
  return '/src/assets/default-avatar2.png';
};

const handleProfileImageError = (event) => {
  // Fallback to default avatar if image fails to load
  event.target.src = '/src/assets/default-avatar2.png';
};

const handleLogout = async () => {
  try {
    userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<style>
:root {
  /* Default dark theme variables - will be overridden by theme store */
  --primary-bg: #121212;
  --secondary-bg: #1e1e1e;
  --tertiary-bg: #2d2d2d;
  --accent-color: #05b83a;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #808080;
  --border-color: #2d2d2d;
  --border-light: #404040;
  --hover-bg: #333333;
  --card-bg: #1e1e1e;
  --input-bg: #2d2d2d;
  --input-border: #404040;
  --shadow: rgba(0, 0, 0, 0.3);
  --shadow-light: rgba(0, 0, 0, 0.1);
  --success: #4caf50;
  --error: #f44336;
  --warning: #ff9800;
  --info: #2196f3;

  /* Legacy variables for backward compatibility */
  --primary-black: var(--primary-bg);
  --secondary-black: var(--secondary-bg);
  --tertiary-black: var(--tertiary-bg);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--primary-bg);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--secondary-bg);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  height: 72px; /* Fixed header height */
  box-shadow: 0 2px 4px var(--shadow-light);
}

/* Add margin-top to main content to account for fixed header */
.main-content {
  margin-top: 72px; /* Match header height exactly */
  flex: 1;
  min-height: calc(100vh - 72px);
  background: var(--primary-bg);
}

nav {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative; 
  box-sizing: border-box;
}

/* Add styles for nav links container */
.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

/* Style the nav links */
.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--accent-color);
}

/* Style for active route */
.nav-link.router-link-active {
  color: var(--accent-color);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-color);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Auth buttons styles */
.auth-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Auth section for authenticated users */
.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-login {
  color: var(--text-primary);
  border: 1px solid var(--accent-color);
}

.btn-login:hover {
  background-color: var(--accent-color);
  color: var(--primary-bg);
}

.btn-register {
  background-color: var(--accent-color);
  color: var(--primary-bg);
}

.btn-register:hover {
  opacity: 0.9;
}

/* Profile dropdown styles */
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
  background-color: var(--hover-bg);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* Dropdown menu styles */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 280px;
  padding: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px var(--shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
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
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: var(--hover-bg);
}

.dropdown-item i {
  color: var(--text-secondary);
  width: 20px;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

.logout-btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #ff4757;
}

.logout-btn i {
  color: #ff4757;
}

/* Responsive styles */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }

  .nav-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--secondary-bg);
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    display: none;
    border-top: 1px solid var(--border-color);
  }

  .nav-container.active {
    display: flex;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 0;
  }

  .nav-link {
    display: block;
    padding: 0.75rem 1rem;
    width: 100%;
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    text-align: center;
  }

  .profile-dropdown {
    width: 100%;
  }

  .profile-btn {
    width: 100%;
    justify-content: space-between;
  }

  .dropdown-menu {
    position: static;
    width: 100%;
    margin-top: 0.5rem;
    box-shadow: none;
  }

  .main-content {
    margin-top: 72px; /* Keep consistent header height */
    padding: 0; /* Let child components handle their own padding */
  }

  nav {
    padding: 0.75rem 1rem; /* Reduce padding on mobile */
  }
}
</style>
