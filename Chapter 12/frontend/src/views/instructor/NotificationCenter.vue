<template>
  <div class="notification-center">
    <div class="header">
      <h1 class="page-title">Notification Center</h1>
      <div class="header-actions">
        <div class="connection-status" :class="connectionStatusClass">
          <i :class="connectionIcon"></i>
          {{ connectionStatusText }}
        </div>
        <button
          @click="refreshNotifications"
          class="refresh-btn"
          :disabled="notificationStore.isLoading"
        >
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
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ enrolledStudents }}</div>
          <div class="stat-label">Students in My Courses</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ myCourses.length }}</div>
          <div class="stat-label">My Courses</div>
        </div>
      </div>
    </div>

    <!-- Instructor Eligibility Warning -->
    <div v-if="!instructorEligibility.loading && !instructorEligibility.eligible" class="eligibility-warning">
      <div class="warning-card">
        <div class="warning-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="warning-content">
          <h3>Notification Sending Not Available</h3>
          <p>{{ instructorEligibility.reason }}</p>
          <div v-if="instructorEligibility.instructor_info" class="instructor-stats">
            <div class="stat-item">
              <span class="label">Total Courses:</span>
              <span class="value">{{ instructorEligibility.instructor_info.total_courses }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Courses with Students:</span>
              <span class="value">{{ instructorEligibility.instructor_info.courses_with_students }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Total Enrolled Students:</span>
              <span class="value">{{ instructorEligibility.instructor_info.total_enrolled_students }}</span>
            </div>
          </div>
          <div class="action-suggestions">
            <p><strong>To enable notifications:</strong></p>
            <ul>
              <li v-if="instructorEligibility.instructor_info?.total_courses === 0">
                Create your first course in the "My Courses" section
              </li>
              <li v-else-if="instructorEligibility.instructor_info?.courses_with_students === 0">
                Wait for students to enroll in your courses, or promote your courses to attract students
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Notification Section -->
    <div v-if="instructorEligibility.eligible" class="send-notification-section">
      <h2>Send Notification to Students</h2>
      <div class="notification-form">
        <div class="form-row">
          <div class="form-group">
            <label>Notification Type:</label>
            <select v-model="newNotification.type" class="form-select">
              <option value="course_update">Course Update</option>
              <option value="live_class">Live Class Announcement</option>
              <option value="assignment">Assignment Notification</option>
              <option value="grade_update">Grade Update</option>
              <option value="general">General Announcement</option>
            </select>
          </div>

          <div class="form-group">
            <label>Target Course:</label>
            <select
              v-model="newNotification.courseId"
              class="form-select"
              :disabled="myCourses.length === 0"
            >
              <option value="">All My Courses ({{ enrolledStudents }} students)</option>
              <option v-for="course in myCourses" :key="course.id" :value="course.id">
                {{ course.title }} ({{ course.enrolled_students || 0 }} students)
              </option>
            </select>
            <small v-if="myCourses.length === 0" class="course-loading-text">
              Loading your courses...
            </small>
            <small v-else class="course-info-text">
              {{ myCourses.length }} course{{ myCourses.length !== 1 ? 's' : '' }} available
            </small>
          </div>
        </div>

        <div class="form-group">
          <label>Title:</label>
          <input
            v-model="newNotification.title"
            type="text"
            class="form-input"
            placeholder="Notification title"
            maxlength="255"
          />
        </div>

        <div class="form-group">
          <label>Message:</label>
          <textarea
            v-model="newNotification.message"
            class="form-textarea"
            placeholder="Notification message"
            rows="4"
          ></textarea>
        </div>

        <div class="form-actions">
          <button @click="sendNotification" class="send-btn" :disabled="!canSendNotification">
            <i class="fas fa-paper-plane"></i>
            Send to {{ getTargetAudience() }}
          </button>
          <button @click="clearForm" class="clear-btn">
            <i class="fas fa-times"></i>
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- My Notifications -->
    <div class="my-notifications-section">
      <div class="section-header">
        <h2>My Notifications</h2>
        <div class="section-actions">
          <div class="filter-group">
            <select v-model="filterType" class="filter-select">
              <option value="all">All Types</option>
              <option value="course_update">Course Updates</option>
              <option value="live_class">Live Classes</option>
              <option value="grade_update">Grade Updates</option>
              <option value="private_message">Messages</option>
            </select>
          </div>
          <button
            @click="markAllAsRead"
            class="mark-all-btn"
            :disabled="notificationStore.unreadCount === 0"
          >
            <i class="fas fa-check-double"></i>
            Mark All Read
          </button>
        </div>
      </div>

      <div class="notifications-list" v-if="filteredNotifications.length > 0">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.notification_type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <h4>{{ notification.title }}</h4>
              <span class="notification-time">{{
                formatTime(notification.time || notification.created_at)
              }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="notification-type">{{
                formatType(notification.notification_type)
              }}</span>
              <span
                class="notification-status"
                :class="{ read: notification.read, unread: !notification.read }"
              >
                {{ notification.read ? 'Read' : 'Unread' }}
              </span>
            </div>
          </div>
          <div class="notification-actions">
            <button
              v-if="!notification.read"
              @click="markAsRead(notification.id)"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '../../stores/notificationStore';
import { useUserStore } from '../../stores/userStore';
import { useToast } from '../../composables/useToast';
import apiClient from '../../services/apiClient';
import { instructorService } from '../../services/instructorService';
import { courseService } from '../../services/courseService';

const notificationStore = useNotificationStore();
const userStore = useUserStore();
const { showToast } = useToast();

// Reactive data
const filterType = ref('all');
const enrolledStudents = ref(0);
const myCourses = ref([]);

// Instructor eligibility
const instructorEligibility = ref({
  eligible: false,
  reason: '',
  instructor_info: null,
  courses: [],
  loading: true
});

// New notification form
const newNotification = ref({
  type: 'course_update',
  courseId: '',
  title: '',
  message: '',
});

// Computed properties
const connectionStatusClass = computed(() => {
  switch (notificationStore.connectionStatus) {
    case 'connected':
      return 'connected';
    case 'connecting':
      return 'connecting';
    case 'fallback':
      return 'fallback';
    case 'error':
      return 'error';
    default:
      return 'disconnected';
  }
});

const connectionIcon = computed(() => {
  switch (notificationStore.connectionStatus) {
    case 'connected':
      return 'fas fa-circle text-success';
    case 'connecting':
      return 'fas fa-circle-notch fa-spin text-warning';
    case 'fallback':
      return 'fas fa-wifi text-info';
    case 'error':
      return 'fas fa-exclamation-circle text-danger';
    default:
      return 'fas fa-circle text-secondary';
  }
});

const connectionStatusText = computed(() => {
  switch (notificationStore.connectionStatus) {
    case 'connected':
      return 'Real-time Connected';
    case 'connecting':
      return 'Connecting...';
    case 'fallback':
      return 'Standard Mode';
    case 'error':
      return 'Connection Error';
    default:
      return 'Disconnected';
  }
});

const filteredNotifications = computed(() => {
  if (filterType.value === 'all') {
    return notificationStore.notifications;
  }
  return notificationStore.notifications.filter((n) => n.notification_type === filterType.value);
});

const canSendNotification = computed(() => {
  return instructorEligibility.value.eligible &&
         newNotification.value.title.trim() &&
         newNotification.value.message.trim();
});

// Methods
const checkInstructorEligibility = async () => {
  try {
    console.log('🔍 Checking instructor eligibility...');
    instructorEligibility.value.loading = true;

    const response = await apiClient.get('/api/notifications/instructor-eligibility/');
    console.log('✅ Eligibility API response:', response.data);

    instructorEligibility.value = {
      ...response.data,
      loading: false
    };

    // Update courses list with eligibility data
    if (response.data.courses) {
      myCourses.value = response.data.courses.filter(course => course.has_students);
      console.log('📚 Updated courses with students:', myCourses.value);
    }

    if (response.data.eligible) {
      console.log('✅ Instructor is eligible for notifications');
      showToast('Notification permissions verified', 'success');
    } else {
      console.log('❌ Instructor not eligible:', response.data.reason);
      showToast(`Notification access: ${response.data.reason}`, 'warning');
    }

  } catch (error) {
    console.error('❌ Failed to check instructor eligibility:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    instructorEligibility.value = {
      eligible: false,
      reason: `Failed to check eligibility: ${error.response?.status || error.message}`,
      instructor_info: null,
      courses: [],
      loading: false
    };
    showToast(`Failed to check notification permissions: ${error.response?.status || 'Network error'}`, 'error');
  }
};

const refreshNotifications = async () => {
  try {
    await notificationStore.refreshNotifications();
    showToast('Notifications refreshed', 'success');
  } catch (error) {
    showToast('Failed to refresh notifications', 'error');
  }
};

const sendNotification = async () => {
  try {
    // Debug current user info
    console.log('Current user:', userStore.user);
    console.log('User role:', userStore.user.role);
    console.log('Is instructor:', userStore.isInstructor);

    const payload = {
      notification_type: newNotification.value.type,
      title: newNotification.value.title,
      message: newNotification.value.message,
      course_id: newNotification.value.courseId || null,
    };

    await apiClient.post('/api/notifications/instructor-send/', payload);
    showToast('Notification sent successfully', 'success');
    clearForm();

    // Refresh notifications to see the new one
    await notificationStore.refreshNotifications();
  } catch (error) {
    console.error('Failed to send notification:', error);
    console.error('Error details:', error.response?.data);

    if (error.response?.status === 403) {
      const debugInfo = error.response?.data?.debug;
      console.log('Permission debug info:', debugInfo);

      let message = 'Permission denied. ';
      if (debugInfo) {
        message += `Current user role: "${debugInfo.user_role || 'none'}", is_staff: ${
          debugInfo.is_staff
        }, is_superuser: ${debugInfo.is_superuser}`;
      }
      showToast(message, 'error');
    } else {
      showToast('Failed to send notification', 'error');
    }
  }
};

const clearForm = () => {
  newNotification.value = {
    type: 'course_update',
    courseId: '',
    title: '',
    message: '',
  };
};

const markAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId);
    showToast('Notification marked as read', 'success');
  } catch (error) {
    showToast('Failed to mark notification as read', 'error');
  }
};

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
    showToast('All notifications marked as read', 'success');
  } catch (error) {
    showToast('Failed to mark all notifications as read', 'error');
  }
};

const getTargetAudience = () => {
  if (newNotification.value.courseId) {
    const course = myCourses.value.find((c) => c.id == newNotification.value.courseId);
    return course ? `Students in ${course.title}` : 'Selected Course Students';
  }
  return 'All My Students';
};

const getNotificationIcon = (type) => {
  const iconMap = {
    course_update: 'fas fa-book',
    live_class: 'fas fa-video',
    assignment: 'fas fa-tasks',
    grade_update: 'fas fa-graduation-cap',
    private_message: 'fas fa-envelope',
    general: 'fas fa-bullhorn',
  };
  return iconMap[type] || 'fas fa-bell';
};

const formatTime = (timeString) => {
  if (!timeString) return 'Unknown';

  const date = new Date(timeString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const formatType = (type) => {
  const typeMap = {
    course_update: 'Course Update',
    live_class: 'Live Class',
    assignment: 'Assignment',
    grade_update: 'Grade Update',
    private_message: 'Private Message',
    general: 'General',
  };
  return typeMap[type] || type;
};

const fetchInstructorData = async () => {
  try {
    console.log('Fetching instructor courses...');

    // Try instructor service first
    let coursesResponse;
    try {
      coursesResponse = await instructorService.getInstructorCourses();
      console.log('Successfully fetched courses from instructorService:', coursesResponse.data);
    } catch (instructorError) {
      console.log('InstructorService failed, trying courseService:', instructorError.message);

      // Fallback to course service
      try {
        coursesResponse = await courseService.getInstructorCourses();
        console.log('Successfully fetched courses from courseService:', coursesResponse.data);
      } catch (courseError) {
        console.log('CourseService also failed:', courseError.message);
        throw courseError;
      }
    }

    myCourses.value = coursesResponse.data || [];

    // Calculate total enrolled students
    enrolledStudents.value = myCourses.value.reduce((total, course) => {
      return total + (course.enrolled_students || 0);
    }, 0);

    console.log('Final instructor courses:', myCourses.value);
    console.log('Total enrolled students:', enrolledStudents.value);

    if (myCourses.value.length === 0) {
      console.warn('No courses found for instructor');
      showToast('No courses found. You may need to create courses first.', 'warning');
    }
  } catch (error) {
    console.error('All methods failed to fetch instructor data:', error);
    showToast('Failed to load instructor courses. Using sample data.', 'warning');

    // Fallback to mock data for development
    myCourses.value = [
      { id: 1, title: 'JavaScript Fundamentals', enrolled_students: 25, status: 'published' },
      { id: 2, title: 'React Advanced Concepts', enrolled_students: 18, status: 'published' },
      { id: 3, title: 'Node.js Backend Development', enrolled_students: 22, status: 'draft' },
    ];
    enrolledStudents.value = 65;
  }
};

// Lifecycle
onMounted(async () => {
  console.log('Instructor NotificationCenter mounted');

  // Setup WebSocket connection
  notificationStore.setupWebSocket();

  // Check instructor eligibility first
  await checkInstructorEligibility();

  // Fetch notifications and instructor data
  await Promise.all([notificationStore.fetchNotifications(), fetchInstructorData()]);
});

onUnmounted(() => {
  console.log('Instructor NotificationCenter unmounted');
});
</script>

<style scoped>
.notification-center {
  padding: 2rem;
  margin-top: 0; /* Remove margin since parent handles spacing */
  position: relative;
  z-index: 1;
  min-height: 100%; /* Remove calc since we're inside dashboard container */
  background: var(--primary-bg);
  box-sizing: border-box;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
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

.connection-status.fallback {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
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

/* Eligibility Warning */
.eligibility-warning {
  margin-bottom: 2rem;
}

.warning-card {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  box-shadow: 0 4px 6px rgba(255, 193, 7, 0.1);
}

.warning-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #212529;
  font-size: 1.5rem;
}

.warning-content {
  flex: 1;
}

.warning-content h3 {
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-size: 1.25rem;
  font-weight: 600;
}

.warning-content p {
  margin: 0 0 1rem 0;
  color: #856404;
  line-height: 1.5;
}

.instructor-stats {
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item .label {
  font-size: 0.875rem;
  color: #856404;
  font-weight: 500;
}

.stat-item .value {
  font-size: 1.25rem;
  color: #212529;
  font-weight: 700;
}

.action-suggestions {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.action-suggestions p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #856404;
}

.action-suggestions ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #856404;
}

.action-suggestions li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Send Notification Section */
.send-notification-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px var(--shadow);
}

.send-notification-section h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.notification-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.course-loading-text {
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 0.25rem;
  display: block;
}

.course-info-text {
  color: var(--accent-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.form-select,
.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.send-btn,
.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn {
  background: var(--accent-color);
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background: var(--card-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.clear-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

/* My Notifications Section */
.my-notifications-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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
}

.notification-item:hover {
  border-color: var(--accent-color);
  transform: translateY(-1px);
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
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-center {
    padding: 1rem;
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

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .section-actions {
    width: 100%;
    justify-content: space-between;
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
