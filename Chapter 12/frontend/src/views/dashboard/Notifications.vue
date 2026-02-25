<template>
  <div class="notifications">
    <div class="notifications-header">
      <h1>Notifications</h1>
      <button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="mark-all-read-btn"
      >
        Mark All Read ({{ unreadCount }})
      </button>
    </div>

    <div class="notification-filters">
      <button
        v-for="filter in filters"
        :key="filter.id"
        :class="['filter-btn', { active: currentFilter === filter.id }]"
        @click="currentFilter = filter.id"
      >
        {{ filter.name }}
      </button>
    </div>

    <div class="notifications-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id" 
        :class="['notification-item', { unread: !notification.read }]"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.notification_type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h3>{{ notification.title }}</h3>
            <span class="notification-time">{{ formatTime(notification.time) }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
        </div>
        <button 
          v-if="!notification.read" 
          class="mark-read-btn"
          @click="markAsRead(notification.id)"
        >
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../stores/notificationStore'

const notificationStore = useNotificationStore()
const currentFilter = ref('all')
const loading = ref(true)

const filters = ref([
  { id: 'all', name: 'All' },
  { id: 'unread', name: 'Unread' },
  { id: 'live_class', name: 'Live Classes' },
  { id: 'course_update', name: 'Course Updates' },
  { id: 'private_message', name: 'Messages' },
  { id: 'grade_update', name: 'Grades' }
])

// Use notifications from store
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const filteredNotifications = computed(() => {
  if (currentFilter.value === 'all') {
    return notifications.value
  } else if (currentFilter.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  } else {
    return notifications.value.filter(n => n.notification_type === currentFilter.value)
  }
})

const markAsRead = async (id) => {
  await notificationStore.markAsRead(id)
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const fetchNotifications = async () => {
  loading.value = true
  await notificationStore.fetchNotifications()
  loading.value = false
}

// Format time helper
const formatTime = (timeString) => {
  const date = new Date(timeString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
  return date.toLocaleDateString()
}

// Get notification icon
const getNotificationIcon = (type) => {
  const iconMap = {
    live_class: 'fas fa-video',
    course_update: 'fas fa-book',
    private_message: 'fas fa-envelope',
    grade_update: 'fas fa-graduation-cap',
    general: 'fas fa-bell'
  }
  return iconMap[type] || 'fas fa-bell'
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notifications {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.notifications h1 {
  color: var(--text-primary);
  margin: 0;
}

.mark-all-read-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.mark-all-read-btn:hover {
  opacity: 0.9;
}

.notification-filters {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--secondary-black);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: var(--accent-color);
  color: var(--primary-black);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--secondary-black);
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.notification-item.unread {
  background: var(--tertiary-black);
  border-left: 4px solid var(--accent-color);
}

.notification-icon {
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

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.notification-message {
  color: var(--text-secondary);
}

.mark-read-btn {
  background: transparent;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  padding: 0.5rem;
}

.mark-read-btn:hover {
  color: var(--text-primary);
}
</style>