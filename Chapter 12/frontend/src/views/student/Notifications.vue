<template>
  <div class="student-notifications">
    <div class="header">
      <h1 class="page-title">My Notifications</h1>
      <div class="header-actions">
        <div class="connection-status" :class="connectionStatusClass">
          <i :class="connectionIcon"></i>
          {{ connectionStatusText }}
        </div>
        <button @click="refreshNotifications" class="refresh-btn" :disabled="notificationStore.isLoading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': notificationStore.isLoading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ notificationStore.notifications.length }}</div>
          <div class="stat-label">Total Notifications</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon unread">
          <i class="fas fa-bell-slash"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ notificationStore.unreadCount }}</div>
          <div class="stat-label">Unread Notifications</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ enrolledCourses }}</div>
          <div class="stat-label">Enrolled Courses</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ todayNotifications }}</div>
          <div class="stat-label">Today's Notifications</div>
        </div>
      </div>
    </div>

    <!-- Notification Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Filter by Type:</label>
        <select v-model="filterType" class="filter-select">
          <option value="all">All Types</option>
          <option value="course_update">Course Updates</option>
          <option value="live_class">Live Classes</option>
          <option value="grade_update">Grade Updates</option>
          <option value="assignment">Assignments</option>
          <option value="private_message">Messages</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Filter by Status:</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">All Status</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
      </div>
      
      <div class="filter-actions">
        <button @click="markAllAsRead" class="mark-all-btn" :disabled="notificationStore.unreadCount === 0">
          <i class="fas fa-check-double"></i>
          Mark All Read
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-section">
      <div v-if="filteredNotifications.length > 0" class="notifications-list">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.notification_type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <h4>{{ notification.title }}</h4>
              <span class="notification-time">{{ formatTime(notification.time || notification.created_at) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="notification-type">{{ formatType(notification.notification_type) }}</span>
              <span class="notification-status" :class="{ 'read': notification.read, 'unread': !notification.read }">
                {{ notification.read ? 'Read' : 'Unread' }}
              </span>
            </div>
          </div>
          <div class="notification-actions">
            <button 
              v-if="!notification.read" 
              @click.stop="markAsRead(notification.id)"
              class="mark-read-btn"
              title="Mark as read"
            >
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <h3>No Notifications</h3>
        <p>You don't have any notifications matching the current filter.</p>
        <button @click="loadMockData" class="load-mock-btn">
          <i class="fas fa-database"></i>
          Load Sample Notifications
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '../../stores/notificationStore'
import { useUserStore } from '../../stores/userStore'
import { useToast } from '../../composables/useToast'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const { showToast } = useToast()

// Reactive data
const filterType = ref('all')
const filterStatus = ref('all')
const enrolledCourses = ref(3) // Mock data

// Computed properties
const connectionStatusClass = computed(() => {
  switch (notificationStore.connectionStatus) {
    case 'connected': return 'connected'
    case 'connecting': return 'connecting'
    case 'error': return 'error'
    default: return 'disconnected'
  }
})

const connectionIcon = computed(() => {
  switch (notificationStore.connectionStatus) {
    case 'connected': return 'fas fa-circle text-success'
    case 'connecting': return 'fas fa-circle-notch fa-spin text-warning'
    case 'error': return 'fas fa-exclamation-circle text-danger'
    default: return 'fas fa-circle text-secondary'
  }
})

const connectionStatusText = computed(() => {
  switch (notificationStore.connectionStatus) {
    case 'connected': return 'Connected'
    case 'connecting': return 'Connecting...'
    case 'error': return 'Connection Error'
    default: return 'Disconnected'
  }
})

const filteredNotifications = computed(() => {
  let notifications = notificationStore.notifications
  
  // Filter by type
  if (filterType.value !== 'all') {
    notifications = notifications.filter(n => n.notification_type === filterType.value)
  }
  
  // Filter by status
  if (filterStatus.value === 'unread') {
    notifications = notifications.filter(n => !n.read)
  } else if (filterStatus.value === 'read') {
    notifications = notifications.filter(n => n.read)
  }
  
  return notifications
})

const todayNotifications = computed(() => {
  const today = new Date().toDateString()
  return notificationStore.notifications.filter(n => {
    const notificationDate = new Date(n.time || n.created_at).toDateString()
    return notificationDate === today
  }).length
})

// Methods
const refreshNotifications = async () => {
  try {
    await notificationStore.refreshNotifications()
    showToast('Notifications refreshed', 'success')
  } catch (error) {
    showToast('Failed to refresh notifications', 'error')
  }
}

const markAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
    showToast('Notification marked as read', 'success')
  } catch (error) {
    showToast('Failed to mark notification as read', 'error')
  }
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    showToast('All notifications marked as read', 'success')
  } catch (error) {
    showToast('Failed to mark all notifications as read', 'error')
  }
}

const loadMockData = () => {
  notificationStore.loadMockNotifications()
  showToast('Sample notifications loaded', 'info')
}

const getNotificationIcon = (type) => {
  const iconMap = {
    'course_update': 'fas fa-book',
    'live_class': 'fas fa-video',
    'assignment': 'fas fa-tasks',
    'grade_update': 'fas fa-graduation-cap',
    'private_message': 'fas fa-envelope',
    'general': 'fas fa-bullhorn'
  }
  return iconMap[type] || 'fas fa-bell'
}

const formatTime = (timeString) => {
  if (!timeString) return 'Unknown'
  
  const date = new Date(timeString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

const formatType = (type) => {
  const typeMap = {
    'course_update': 'Course Update',
    'live_class': 'Live Class',
    'assignment': 'Assignment',
    'grade_update': 'Grade Update',
    'private_message': 'Private Message',
    'general': 'General'
  }
  return typeMap[type] || type
}

// Lifecycle
onMounted(async () => {
  console.log('Student Notifications mounted')
  
  // Setup WebSocket connection
  notificationStore.setupWebSocket()
  
  // Fetch notifications
  await notificationStore.fetchNotifications()
})

onUnmounted(() => {
  console.log('Student Notifications unmounted')
})
</script>

<style scoped>
.student-notifications {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

/* Header */
.header {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
  gap: 2rem;
}

.header h1 {
  margin: 0 !important;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.connection-status.connected {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.connection-status.connecting {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.connection-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.connection-status.disconnected {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-color);
  color: var(--primary-bg);
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px var(--shadow);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--accent-color);
  color: white;
}

.stat-icon.unread {
  background: #f59e0b;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Filters Section */
.filters-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px var(--shadow);
  display: flex;
  gap: 2rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 180px;
}

.filter-actions {
  margin-left: auto;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-all-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.mark-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Notifications Section */
.notifications-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px var(--shadow);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow);
}

.notification-item.unread {
  border-left: 4px solid var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: white;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-message {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.notification-type {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--accent-color);
  color: white;
  font-weight: 500;
}

.notification-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.notification-status.read {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.notification-status.unread {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mark-read-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mark-read-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.load-mock-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-mock-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .student-notifications {
    padding: 0.5rem 1rem 2rem 1rem;
    margin-top: 0;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-actions {
    margin-left: 0;
  }

  .notification-item {
    flex-direction: column;
    gap: 1rem;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
