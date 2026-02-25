<template>
  <div class="relative" ref="notificationRef">
    <!-- Bell Icon Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      :class="{ 'text-blue-600': isOpen }"
    >
      <BellIcon class="w-6 h-6" />
      
      <!-- Notification Count Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
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
        class="notification-dropdown absolute right-0 z-[9999] mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              :disabled="loading"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
            >
              {{ loading ? 'Marking...' : 'Mark all read' }}
            </button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ unreadCount }} unread notification{{ unreadCount !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto custom-scrollbar">
          <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
            <BellIcon class="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No notifications yet</p>
          </div>
          <div
            v-else
            v-for="notification in notifications"
            :key="notification.id"
            @click="markAsRead(notification.id)"
            :class="[
              'p-4 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors',
              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : '',
            ]"
          >
            <div class="flex items-start space-x-3">
              <span class="text-lg">{{ getNotificationIcon(notification.notification_type) }}</span>
              <div class="flex-1 min-w-0">
                <p
                  :class="[
                    'text-sm font-medium',
                    !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                  ]"
                >
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {{ formatTime(notification.time) }}
                </p>
              </div>
              <div
                v-if="!notification.read"
                class="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2"
              ></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-600">
          <router-link
            to="/instructor/notifications"
            @click="closeDropdown"
            class="block w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
    student_enrollment: '👥',
    course_review: '⭐',
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
  transform-origin: top right;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .notification-dropdown {
    width: calc(100vw - 2rem);
    right: -1rem;
    max-width: 320px;
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
</style>
