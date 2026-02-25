<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
        Notification Settings
      </h3>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Settings Form -->
      <div v-else class="space-y-6">
        <!-- Email Notifications -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <EnvelopeIcon class="w-5 h-5 mr-2 text-gray-400" />
            Email Notifications
          </h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Live Class Notifications</label>
                <p class="text-sm text-gray-500">Get notified when live classes are starting</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.email_live_class"
                label="Email live class notifications"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Course Updates</label>
                <p class="text-sm text-gray-500">New lessons, materials, and announcements</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.email_course_update"
                label="Email course updates"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Private Messages</label>
                <p class="text-sm text-gray-500">Messages from instructors and staff</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.email_private_message"
                label="Email private messages"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Grade Updates</label>
                <p class="text-sm text-gray-500">Assignment and quiz grade notifications</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.email_grade_update"
                label="Email grade updates"
              />
            </div>
          </div>
        </div>

        <!-- In-App Notifications -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <DevicePhoneMobileIcon class="w-5 h-5 mr-2 text-gray-400" />
            In-App Notifications
          </h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Live Class Notifications</label>
                <p class="text-sm text-gray-500">Show notifications in the app</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.app_live_class"
                label="In-app live class notifications"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Course Updates</label>
                <p class="text-sm text-gray-500">Show course update notifications</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.app_course_update"
                label="In-app course updates"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Private Messages</label>
                <p class="text-sm text-gray-500">Show message notifications</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.app_private_message"
                label="In-app private messages"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">Grade Updates</label>
                <p class="text-sm text-gray-500">Show grade notifications</p>
              </div>
              <ToggleSwitch
                v-model="localPreferences.app_grade_update"
                label="In-app grade updates"
              />
            </div>
          </div>
        </div>

        <!-- Digest Frequency -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Email Digest Frequency</h4>
          <select
            v-model="localPreferences.digest_frequency"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            @click="savePreferences"
            :disabled="saving"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <CheckIcon v-if="!saving" class="w-4 h-4 mr-2" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>

        <!-- Success/Error Message -->
        <div v-if="message" class="mt-4">
          <div
            :class="[
              'p-4 rounded-md',
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            ]"
          >
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline';
import { useNotificationStore } from '@/stores/notificationStore';
import ToggleSwitch from '@/components/ToggleSwitch.vue';

const notificationStore = useNotificationStore();

// Reactive data
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const localPreferences = ref({});

// Methods
const savePreferences = async () => {
  saving.value = true;
  message.value = '';

  const result = await notificationStore.updatePreferences(localPreferences.value);

  if (result.success) {
    message.value = 'Settings saved successfully!';
    setTimeout(() => {
      message.value = '';
    }, 3000);
  } else {
    message.value = 'Error saving settings. Please try again.';
  }

  saving.value = false;
};

// Lifecycle
onMounted(async () => {
  await notificationStore.fetchPreferences();
  localPreferences.value = { ...notificationStore.preferences };
  loading.value = false;
});

// Watch for changes in store preferences
watch(
  () => notificationStore.preferences,
  (newPreferences) => {
    localPreferences.value = { ...newPreferences };
  },
  { deep: true }
);
</script>
