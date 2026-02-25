<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
        <p class="mt-2 text-gray-600">Manage your notifications and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Notifications List -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-medium text-gray-900">All Notifications</h2>
                <button
                  v-if="unreadCount > 0"
                  @click="markAllAsRead"
                  :disabled="loading"
                  class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {{ loading ? 'Marking...' : 'Mark all read' }}
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <!-- Empty State -->
              <div v-else-if="notifications.length === 0" class="text-center py-8">
                <BellIcon class="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p class="text-gray-500">You're all caught up! Check back later for new updates.</p>
              </div>

              <!-- Notifications List -->
              <div v-else class="space-y-4">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  @click="markAsRead(notification.id)"
                  :class="[
                    'p-4 rounded-lg border cursor-pointer transition-colors',
                    !notification.read 
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex items-start space-x-3">
                    <span class="text-2xl">{{ getNotificationIcon(notification.notification_type) }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <p
                          :class="[
                            'text-sm font-medium',
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          ]"
                        >
                          {{ notification.title }}
                        </p>
                        <div class="flex items-center space-x-2">
                          <span class="text-xs text-gray-400">
                            {{ formatTime(notification.time) }}
                          </span>
                          <div
                            v-if="!notification.read"
                            class="w-2 h-2 bg-blue-600 rounded-full"
                          ></div>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ notification.message }}
                      </p>
                      <div class="flex items-center mt-2">
                        <span
                          :class="[
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getTypeColor(notification.notification_type)
                          ]"
                        >
                          {{ getTypeLabel(notification.notification_type) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="lg:col-span-1">
          <NotificationSettings />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { BellIcon } from '@heroicons/vue/24/outline';
import { useNotificationStore } from '@/stores/notificationStore';
import NotificationSettings from '@/components/NotificationSettings.vue';

const notificationStore = useNotificationStore();

// Reactive data
const loading = ref(true);

// Computed properties
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

// Methods
const fetchNotifications = async () => {
  loading.value = true;
  await notificationStore.fetchNotifications();
  loading.value = false;
};

const markAsRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId);
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
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

const getTypeLabel = (type) => {
  const labelMap = {
    live_class: 'Live Class',
    course_update: 'Course Update',
    private_message: 'Message',
    grade_update: 'Grade',
    general: 'General',
  };
  return labelMap[type] || 'Notification';
};

const getTypeColor = (type) => {
  const colorMap = {
    live_class: 'bg-red-100 text-red-800',
    course_update: 'bg-blue-100 text-blue-800',
    private_message: 'bg-green-100 text-green-800',
    grade_update: 'bg-purple-100 text-purple-800',
    general: 'bg-gray-100 text-gray-800',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-800';
};

const formatTime = (timeString) => {
  const date = new Date(timeString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  fetchNotifications();
});
</script>
