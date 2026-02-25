<template>
  <div class="relative" ref="notificationRef">
    <!-- Bell Icon Button -->
    <button
      @click="toggleDropdown"
      class="bell-button"
      :class="{ 'bell-button--active': isOpen }"
    >
      <BellIcon class="bell-icon" />

      <!-- Notification Count Badge -->
      <span
        v-if="unreadCount > 0"
        class="notification-badge"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="notification-dropdown"
      >
        <!-- Header -->
        <div class="notification-header">
          <div class="flex items-center justify-between">
            <h3 class="notification-title">Notifications</h3>
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              :disabled="loading"
              class="mark-all-btn"
            >
              {{ loading ? 'Marking...' : 'Mark all read' }}
            </button>
          </div>
          <p class="notification-subtitle">
            {{ unreadCount }} unread notification{{ unreadCount !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Notifications List -->
        <div class="notification-list custom-scrollbar">
          <div v-if="notifications.length === 0" class="empty-state">
            <BellIcon class="empty-state-icon" />
            <p class="empty-state-text">No notifications yet</p>
            <p class="empty-state-subtext">You're all caught up!</p>
          </div>
          <div
            v-else
            v-for="notification in notifications"
            :key="notification.id"
            @click="markAsRead(notification.id)"
            :class="[
              'notification-item',
              !notification.read ? 'notification-item--unread' : '',
            ]"
          >
            <div class="notification-content">
              <span class="notification-icon">{{ getNotificationIcon(notification.notification_type) }}</span>
              <div class="notification-text">
                <p
                  :class="[
                    'notification-item-title',
                    !notification.read ? 'notification-item-title--unread' : '',
                  ]"
                >
                  {{ notification.title }}
                </p>
                <p class="notification-item-message">
                  {{ notification.message }}
                </p>
                <p class="notification-item-time">
                  {{ formatTime(notification.time) }}
                </p>
              </div>
            </div>
        </div>
      </div>

        <!-- Footer -->
        <div class="notification-footer">
          <router-link
            to="/dashboard/notifications"
            @click="closeDropdown"
            class="view-all-btn"
          >
            View all notifications
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BellIcon } from '@heroicons/vue/24/outline';
import { useNotificationStore } from '../stores/notificationStore';

// Stores
const notificationStore = useNotificationStore();

// Reactive data
const isOpen = ref(false);
const loading = ref(false);
const notificationRef = ref(null);

// Computed properties from store
const notifications = computed(() => notificationStore.recentNotifications);
const unreadCount = computed(() => notificationStore.unreadCount);

// Methods
const toggleDropdown = async () => {
  if (!isOpen.value) {
    await fetchNotificationData();
  }
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    closeDropdown();
  }
};

const fetchNotificationCount = async () => {
  await notificationStore.refreshNotifications();
};

const fetchNotificationData = async () => {
  await notificationStore.refreshNotifications();
};

const markAsRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId);
};

const markAllAsRead = async () => {
  loading.value = true;
  await notificationStore.markAllAsRead();
  loading.value = false;
};

const getNotificationIcon = (type) => {
  const iconMap = {
    live_class: '🎥',
    course_update: '📚',
    private_message: '✉️',
    grade_update: '🎓',
    general: '📢',
  };
  return iconMap[type] || '🔔';
};

const formatTime = (timeString) => {
  const date = new Date(timeString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Lifecycle
onMounted(() => {
  fetchNotificationCount();
  document.addEventListener('mousedown', handleClickOutside);

  // Set up periodic refresh (every 30 seconds)
  const interval = setInterval(fetchNotificationCount, 30000);

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    clearInterval(interval);
  });
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 380px;
  max-height: 480px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 9999;
  overflow: hidden;
  transform-origin: top right;
  transition: all 0.2s ease-in-out;
}

.dark .notification-dropdown {
  background: #1f2937;
  border-color: #374151;
}

/* Bell Button Styles */
.bell-button {
  position: relative;
  padding: 0.5rem;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
}

.bell-button:hover {
  color: #111827;
  background: #f3f4f6;
  transform: scale(1.05);
}

.bell-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.bell-button--active {
  color: #3b82f6;
  background: #dbeafe;
}

.dark .bell-button {
  color: #9ca3af;
}

.dark .bell-button:hover {
  color: #f9fafb;
  background: #374151;
}

.dark .bell-button--active {
  color: #60a5fa;
  background: #1e3a8a;
}

.bell-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Notification Badge Styles */
.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  color: white;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

.dark .notification-badge {
  border-color: #1f2937;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Header Styles */
.notification-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .notification-header {
  border-bottom-color: #374151;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.notification-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .notification-title {
  color: #f9fafb;
}

.notification-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.dark .notification-subtitle {
  color: #9ca3af;
}

.mark-all-btn {
  font-size: 0.875rem;
  color: #2563eb;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  border: none;
  background: transparent;
  cursor: pointer;
}

.mark-all-btn:hover {
  color: #1d4ed8;
  background: #dbeafe;
}

.mark-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dark .mark-all-btn {
  color: #60a5fa;
}

.dark .mark-all-btn:hover {
  color: #93c5fd;
  background: #1e3a8a;
}

/* Footer Styles */
.notification-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .notification-footer {
  border-top-color: #374151;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.view-all-btn {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  color: #3b82f6;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.view-all-btn:hover {
  color: white;
  background: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.dark .view-all-btn {
  color: #60a5fa;
  background: #1f2937;
  border-color: #60a5fa;
}

.dark .view-all-btn:hover {
  color: #1f2937;
  background: #60a5fa;
  box-shadow: 0 4px 8px rgba(96, 165, 250, 0.3);
}

/* Notification Item Styles */
.notification-item {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.notification-item:hover {
  background: #f9fafb;
  transform: translateX(2px);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item--unread {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 3px solid #3b82f6;
}

.notification-item--unread::before {
  content: '';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #dbeafe;
}

.dark .notification-item {
  border-bottom-color: #374151;
}

.dark .notification-item:hover {
  background: #374151;
}

.dark .notification-item--unread {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-left-color: #60a5fa;
}

.dark .notification-item--unread::before {
  background: #60a5fa;
  box-shadow: 0 0 0 2px #1e3a8a;
}

/* Notification Content Styles */
.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.notification-icon {
  font-size: 1.125rem;
  color: #6b7280;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.dark .notification-icon {
  color: #9ca3af;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: #374151;
  line-height: 1.4;
}

.notification-item-title--unread {
  color: #111827;
  font-weight: 600;
}

.dark .notification-item-title {
  color: #d1d5db;
}

.dark .notification-item-title--unread {
  color: #f9fafb;
}

.notification-item-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .notification-item-message {
  color: #9ca3af;
}

.notification-item-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.dark .notification-item-time {
  color: #6b7280;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin: 0.5rem 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.5) 100%);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.5) 0%, rgba(156, 163, 175, 0.7) 100%);
  background-clip: content-box;
}

/* Notification list container */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

/* Empty State Styles */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.empty-state-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
  opacity: 0.7;
}

.empty-state-text {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.empty-state-subtext {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.dark .empty-state {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.dark .empty-state-icon {
  color: #4b5563;
}

.dark .empty-state-text {
  color: #9ca3af;
}

.dark .empty-state-subtext {
  color: #6b7280;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .notification-dropdown {
    width: calc(100vw - 1rem);
    right: 0.5rem;
    max-width: 360px;
    position: fixed;
    top: 60px;
    margin-top: 0;
    border-radius: 8px;
    max-height: calc(100vh - 80px);
  }

  .notification-header {
    padding: 1rem;
  }

  .notification-item {
    padding: 0.875rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}

/* Ensure dropdown doesn't overflow viewport */
@media (min-width: 641px) {
  .notification-dropdown {
    max-height: calc(100vh - 100px);
    right: 0;
  }
}

/* Dark mode scrollbar */
.dark .custom-scrollbar {
  scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

/* Animation for dropdown appearance */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification-dropdown {
  animation: slideDown 0.2s ease-out;
}
</style>
