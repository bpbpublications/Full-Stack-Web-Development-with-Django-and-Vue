<template>
  <div class="instructor-profile">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back to Instructors
      </button>
      <h1>Instructor Profile</h1>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading instructor profile...</p>
    </div>

    <div v-else-if="!instructor" class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <p>Instructor not found</p>
      <button class="back-btn" @click="goBack">Return to Instructors</button>
    </div>

    <div v-else class="profile-content">
      <div class="profile-header">
        <div class="profile-avatar">
          <img v-if="instructor.avatar" :src="instructor.avatar" :alt="instructor.name" class="avatar-image">
          <span v-else class="avatar-initials">{{ getInitials(instructor.name) }}</span>
        </div>
        <div class="profile-info">
          <h2>{{ instructor.name }}</h2>
          <p class="specialization">{{ instructor.specialization }}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <i class="fas fa-book"></i>
              <span>{{ instructor.courses_count || instructor.courses || 0 }} courses</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <span>{{ instructor.students_count || instructor.students || 0 }} students</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-star"></i>
              <span>{{ instructor.average_rating || instructor.rating || 0 }} rating</span>
            </div>
          </div>
          <div class="status-badge" :class="instructor.is_active ? 'active' : 'inactive'">
            {{ instructor.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>
      </div>

      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="overview-tab">
          <div class="info-card">
            <h3>About</h3>
            <p>{{ instructor.bio || 'No bio information available.' }}</p>
          </div>
          
          <div class="info-card">
            <h3>Contact Information</h3>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>{{ instructor.email }}</span>
              </div>
              <div class="contact-item" v-if="instructor.phone">
                <i class="fas fa-phone"></i>
                <span>{{ instructor.phone }}</span>
              </div>
              <div class="contact-item" v-if="instructor.website">
                <i class="fas fa-globe"></i>
                <span>{{ instructor.website }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Courses Tab -->
        <div v-if="activeTab === 'courses'" class="courses-tab">
          <div v-if="!instructor.coursesList || instructor.coursesList.length === 0" class="empty-state">
            <i class="fas fa-book"></i>
            <p>No courses available</p>
          </div>
          <div v-else class="courses-grid">
            <div v-for="(course, index) in instructor.coursesList" :key="index" class="course-card">
              <img :src="course.image || '/default-course.jpg'" :alt="course.title" class="course-image">
              <div class="course-content">
                <h3>{{ course.title }}</h3>
                <p class="course-description">{{ course.description }}</p>
                <div class="course-stats">
                  <span><i class="fas fa-users"></i> {{ course.students }} students</span>
                  <span><i class="fas fa-star"></i> {{ course.rating }}</span>
                </div>
                <button class="view-course-btn">View Course</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="reviews-tab">
          <div v-if="!instructor.reviews || instructor.reviews.length === 0" class="empty-state">
            <i class="fas fa-star"></i>
            <p>No reviews available</p>
          </div>
          <div v-else class="reviews-list">
            <div v-for="(review, index) in instructor.reviews" :key="index" class="review-item">
              <div class="review-header">
                <div class="student-info">
                  <img :src="review.studentAvatar || '/default-avatar.png'" :alt="review.studentName" class="student-avatar">
                  <div>
                    <h4>{{ review.studentName }}</h4>
                    <p class="course-name">{{ review.courseName }}</p>
                  </div>
                </div>
                <div class="review-rating">
                  <div class="stars">{{ '⭐'.repeat(review.rating) }}</div>
                  <div class="date">{{ formatDate(review.date) }}</div>
                </div>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
          </div>
        </div>

        <!-- Actions Tab -->
        <div v-if="activeTab === 'actions'" class="actions-tab">
          <div class="action-card">
            <h3>Account Status</h3>
            <p>Current status: <span :class="['status-text', instructor.status]">{{ instructor.status }}</span></p>
            <button 
              @click="toggleStatus" 
              :class="['status-toggle-btn', instructor.status === 'active' ? 'deactivate' : 'activate']"
            >
              {{ instructor.status === 'active' ? 'Deactivate Account' : 'Activate Account' }}
            </button>
          </div>
          
          <div class="action-card">
            <h3>Admin Actions</h3>
            <div class="admin-actions">
              <button class="action-btn warning">
                <i class="fas fa-envelope"></i> Send Message
              </button>
              <button class="action-btn danger">
                <i class="fas fa-exclamation-triangle"></i> Flag Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const instructorId = parseInt(route.params.id)
const instructor = ref(null)
const loading = ref(true)
const activeTab = ref('overview')

const tabs = [
  { id: 'overview', name: 'Overview' },
  { id: 'courses', name: 'Courses' },
  { id: 'reviews', name: 'Reviews' },
  { id: 'actions', name: 'Actions' }
]

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Mock data for demonstration
const instructorsData = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Data Science Expert',
    courses: 12,
    students: 2500,
    rating: 4.8,
    status: 'active',
    avatar: null,
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    website: 'www.sarahjohnson.com',
    bio: 'Dr. Sarah Johnson is a renowned data scientist with over 10 years of experience in the field. She has worked with major tech companies and has published several research papers on machine learning and artificial intelligence.',
    coursesList: [
      {
        title: 'Advanced Data Science',
        description: 'Learn advanced data science techniques and methodologies.',
        students: 850,
        rating: 4.9,
        image: null
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'A comprehensive introduction to machine learning concepts.',
        students: 1200,
        rating: 4.7,
        image: null
      }
    ],
    reviews: [
      {
        studentName: 'John Smith',
        studentAvatar: null,
        courseName: 'Advanced Data Science',
        rating: 5,
        date: '2023-05-15',
        content: 'Excellent course! Dr. Johnson explains complex concepts in a very understandable way.'
      },
      {
        studentName: 'Emily Davis',
        studentAvatar: null,
        courseName: 'Machine Learning Fundamentals',
        rating: 4,
        date: '2023-04-20',
        content: 'Very informative course. I learned a lot about machine learning algorithms.'
      }
    ]
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    specialization: 'Web Development',
    courses: 8,
    students: 1800,
    rating: 4.6,
    status: 'active',
    avatar: null,
    email: 'michael.chen@example.com',
    bio: 'Professor Michael Chen is a web development expert with extensive experience in modern frontend and backend technologies.',
    coursesList: [
      {
        title: 'Full Stack Web Development',
        description: 'Learn to build complete web applications from frontend to backend.',
        students: 750,
        rating: 4.8,
        image: null
      }
    ],
    reviews: [
      {
        studentName: 'Alex Johnson',
        studentAvatar: null,
        courseName: 'Full Stack Web Development',
        rating: 5,
        date: '2023-06-10',
        content: 'Professor Chen is an excellent instructor. The course content is very practical.'
      }
    ]
  }
]

onMounted(async () => {
  console.log('InstructorProfile mounted, instructor ID:', instructorId)

  try {
    // Import the instructor service
    const { instructorService } = await import('../../services/instructorService')

    // Fetch instructor details from the service
    const response = await instructorService.getInstructorById(instructorId)
    instructor.value = response.data
    loading.value = false

    console.log('Instructor profile loaded:', instructor.value)
  } catch (error) {
    console.error('Error loading instructor profile:', error)
    instructor.value = null
    loading.value = false
  }
})

const goBack = () => {
  router.push('/admin/instructors')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const toggleStatus = async () => {
  if (!instructor.value) return

  try {
    // Import the instructor service
    const { instructorService } = await import('../../services/instructorService')

    // Get current status
    const currentStatus = instructor.value.is_active ? 'active' : 'inactive'
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

    console.log(`Toggling instructor ${instructor.value.name} from ${currentStatus} to ${newStatus}`)

    // Call the service to toggle status
    await instructorService.toggleInstructorStatus(instructor.value.id, newStatus === 'active')

    // Update the local state
    instructor.value.is_active = newStatus === 'active'
    instructor.value.status = newStatus

    console.log('Status toggled successfully')
  } catch (error) {
    console.error('Error toggling instructor status:', error)
  }
}
</script>

<style scoped>
.instructor-profile {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px; /* Exact height of admin header */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

.header {
  display: flex !important;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
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

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--tertiary-black);
  border: none;
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--accent-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Profile content wrapper for better layout */
.profile-content {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px var(--shadow);
  max-width: 1200px; /* Increased width like a modal */
  margin: 0 auto; /* Center the content */
}

.profile-header {
  display: flex;
  gap: 2rem;
  background: var(--secondary-bg);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: var(--primary-bg);
  font-weight: 600;
  font-size: 3rem;
  overflow: hidden;
  flex-shrink: 0;
  border: 4px solid var(--border-color);
  box-shadow: 0 4px 12px var(--shadow);
}

.profile-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-avatar .avatar-initials {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.profile-info {
  flex: 1;
}

.specialization {
  color: var(--text-secondary);
  margin: 0.5rem 0 1rem;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(var(--success-color-rgb), 0.2);
  color: var(--success-color);
}

.status-badge.inactive {
  background-color: rgba(var(--danger-color-rgb), 0.2);
  color: var(--danger-color);
}

.status-badge.pending {
  background-color: rgba(var(--warning-color-rgb), 0.2);
  color: var(--warning-color);
}

.profile-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
  position: relative;
}

.tab-btn.active {
  color: var(--accent-color);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-color);
}

.info-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-content {
  padding: 1.5rem;
}

.course-description {
  color: var(--text-secondary);
  margin: 0.5rem 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-stats {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.view-course-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.course-name {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.review-rating {
  text-align: right;
}

.date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.review-content {
  color: var(--text-primary);
  line-height: 1.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: var(--secondary-black);
  border-radius: 12px;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.action-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.status-text {
  font-weight: 500;
}

.status-text.active {
  color: var(--success-color);
}

.status-text.inactive {
  color: var(--danger-color);
}

.status-toggle-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.status-toggle-btn.deactivate {
  background: var(--danger-color);
  color: white;
}

.status-toggle-btn.activate {
  background: var(--success-color);
  color: white;
}

.admin-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn.warning {
  background: var(--warning-color);
  color: white;
}

.action-btn.danger {
  background: var(--danger-color);
  color: white;
}

/* Responsive Design */
@media (min-width: 769px) {
  .instructor-profile {
    margin-top: 72px; /* Exact admin header height */
    padding-top: 0.5rem; /* Reduced by half */
  }

  .header h1 {
    font-size: 2rem !important;
  }

  .profile-content {
    max-width: 1200px; /* Wide layout on desktop */
  }
}

@media (max-width: 768px) {
  .instructor-profile {
    padding: 0.5rem;
    margin-top: 0; /* Admin header is relative on mobile */
    padding-top: 0.5rem;
  }

  .header {
    padding: 1rem;
    margin-bottom: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header h1 {
    font-size: 1.5rem !important;
  }

  .profile-content {
    max-width: 100%;
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
    font-size: 2.5rem;
  }

  .profile-avatar .avatar-initials {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .instructor-profile {
    padding: 0.25rem;
    padding-top: 0.25rem;
  }

  .header {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .header h1 {
    font-size: 1.25rem !important;
  }

  .profile-content {
    padding: 0.75rem;
  }

  .profile-header {
    padding: 1rem;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .profile-avatar .avatar-initials {
    font-size: 2rem;
  }
}
</style>