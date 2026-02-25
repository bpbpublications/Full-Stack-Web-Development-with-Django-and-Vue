<template>
  <div class="admin-course-lessons">
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i> Back to Course
        </button>
        <h1>{{ course ? course.name : 'Course' }} Lessons</h1>
      </div>
      <div class="header-actions">
        <button class="add-lesson-btn" @click="toggleAddLessonModal">
          <i class="fas fa-plus"></i> Add Lesson
        </button>
      </div>
    </div>

    <!-- Course navigation tabs -->
    <div class="course-tabs">
      <div class="tab" @click="goToCourseDetails">Overview</div>
      <div class="tab active">Lessons</div>
      <div class="tab" @click="goToReviews">Reviews</div>
      <div class="tab" @click="goToStudents">Students</div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading lessons...</p>
    </div>

    <div v-else-if="!course" class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h2>Course Not Found</h2>
      <p>The course you're looking for doesn't exist or has been removed.</p>
      <button class="back-btn" @click="goBack">Return to Courses</button>
    </div>

    <div v-else>
      <div class="course-info-card">
        <div class="course-info-header">
          <img :src="course.image || '/default-course.jpg'" :alt="course.name" class="course-image">
          <div class="course-details">
            <h2>{{ course.name }}</h2>
            <p class="instructor">Instructor: {{ course.instructor }}</p>
            <div class="course-stats">
              <span><i class="fas fa-users"></i> {{ course.enrolled }} students</span>
              <span><i class="fas fa-star"></i> {{ course.rating }}</span>
              <span :class="['status-badge', course.status]">{{ course.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lessons-container">
        <h2>Lessons</h2>
        
        <div v-if="!course.lessons || course.lessons.length === 0" class="no-lessons">
          <i class="fas fa-book"></i>
          <p>No lessons available for this course yet.</p>
          <button class="add-lesson-btn" @click="showAddLessonModal = true">Add First Lesson</button>
        </div>
        
        <div v-else class="lessons-list">
          <div v-for="(lesson, index) in course.lessons" :key="index" class="lesson-item">
            <div class="lesson-content">
              <div class="lesson-number">{{ index + 1 }}</div>
              <div class="lesson-details">
                <h3>{{ lesson }}</h3>
              </div>
            </div>
            <div class="lesson-actions">
              <button class="edit-btn" @click="editLesson(index)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn" @click="confirmDeleteLesson(index)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Lesson Modal -->
    <div class="modal-overlay" v-if="showAddLessonModal" @click="showAddLessonModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingLessonIndex !== null ? 'Edit Lesson' : 'Add New Lesson' }}</h2>
          <button class="close-btn" @click="showAddLessonModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="editingLessonIndex !== null ? updateLesson() : addLesson()">
            <div class="form-group">
              <label for="lessonTitle">Lesson Title</label>
              <input 
                type="text" 
                id="lessonTitle" 
                v-model="newLesson.title" 
                placeholder="Enter lesson title"
                required
              >
            </div>
            <div class="form-group">
              <label for="lessonDescription">Description</label>
              <textarea 
                id="lessonDescription" 
                v-model="newLesson.description" 
                placeholder="Enter lesson description"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="lessonDuration">Duration (minutes)</label>
              <input 
                type="number" 
                id="lessonDuration" 
                v-model="newLesson.duration" 
                min="1"
              >
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showAddLessonModal = false">
                Cancel
              </button>
              <button type="submit" class="submit-btn">
                {{ editingLessonIndex !== null ? 'Update Lesson' : 'Add Lesson' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div class="modal-overlay" v-if="showDeleteConfirmModal" @click="showDeleteConfirmModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button class="close-btn" @click="showDeleteConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this lesson?</p>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteConfirmModal = false">
              Cancel
            </button>
            <button type="button" class="delete-btn" @click="deleteLesson">
              Delete Lesson
            </button>
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
const courseId = parseInt(route.params.id)
const course = ref(null)
const loading = ref(true)
const showAddLessonModal = ref(false)
const showDeleteConfirmModal = ref(false)
const editingLessonIndex = ref(null)
const lessonToDeleteIndex = ref(null)
const newLesson = ref({
  title: '',
  description: '',
  duration: 30
})

// Sample course data for testing
const coursesData = [
  {
    id: 1,
    name: 'Introduction to JavaScript',
    instructor: 'John Doe',
    image: '/course1.jpg',
    enrolled: 120,
    rating: 4.5,
    status: 'active',
    lessons: [
      'JavaScript Basics',
      'Variables and Data Types',
      'Functions and Scope'
    ]
  },
  {
    id: 2,
    name: 'Advanced CSS Techniques',
    instructor: 'Jane Smith',
    image: '/course2.jpg',
    enrolled: 85,
    rating: 4.2,
    status: 'active',
    lessons: [
      'Flexbox Layout',
      'CSS Grid',
      'Animations and Transitions',
      'Responsive Design'
    ]
  },
  {
    id: 3,
    name: 'Machine Learning Basics',
    instructor: 'Mike Johnson',
    image: '/course3.jpg',
    enrolled: 0,
    rating: 0,
    status: 'draft',
    lessons: [
      'Introduction to ML',
      'Supervised Learning',
      'Unsupervised Learning'
    ]
  }
]

onMounted(() => {
  // Simulate API call
  setTimeout(() => {
    course.value = coursesData.find(c => c.id === courseId) || null
    loading.value = false
    console.log('Component mounted, Add Lesson button should be visible')
  }, 500)
})

// Navigation functions
const goBack = () => {
  router.push(`/admin/courses/${courseId}`)
}

const goToCourseDetails = () => {
  router.push(`/admin/courses/${courseId}`)
}

const goToReviews = () => {
  router.push(`/admin/courses/${courseId}/reviews`)
}

const goToStudents = () => {
  router.push(`/admin/courses/${courseId}/students`)
}

// Lesson management functions
const addLesson = () => {
  if (!course.value) return
  
  // Add the new lesson to the course
  if (!course.value.lessons) {
    course.value.lessons = []
  }
  
  course.value.lessons.push(newLesson.value.title)
  
  // Reset form and close modal
  newLesson.value = {
    title: '',
    description: '',
    duration: 30
  }
  showAddLessonModal.value = false
  
  // Log for debugging
  console.log('Lesson added:', course.value.lessons)
}

const editLesson = (index) => {
  editingLessonIndex.value = index
  newLesson.value = {
    title: course.value.lessons[index],
    description: '', // We don't have this data in our simple model
    duration: 30     // We don't have this data in our simple model
  }
  showAddLessonModal.value = true
}

const updateLesson = () => {
  if (editingLessonIndex.value === null || !course.value) return
  
  // Update the lesson
  course.value.lessons[editingLessonIndex.value] = newLesson.value.title
  
  // Reset form and close modal
  newLesson.value = {
    title: '',
    description: '',
    duration: 30
  }
  editingLessonIndex.value = null
  showAddLessonModal.value = false
  
  // Log for debugging
  console.log('Lesson updated:', course.value.lessons)
}

const confirmDeleteLesson = (index) => {
  lessonToDeleteIndex.value = index
  showDeleteConfirmModal.value = true
}

const deleteLesson = () => {
  if (lessonToDeleteIndex.value === null || !course.value) return
  
  // Remove the lesson
  course.value.lessons.splice(lessonToDeleteIndex.value, 1)
  
  // Close modal and reset
  showDeleteConfirmModal.value = false
  lessonToDeleteIndex.value = null
  
  // Log for debugging
  console.log('Lesson deleted, remaining lessons:', course.value.lessons)
}

// Add a method to toggle the modal visibility
const toggleAddLessonModal = () => {
  console.log('Toggle modal called, current state:', showAddLessonModal.value)
  showAddLessonModal.value = !showAddLessonModal.value
  console.log('New modal state:', showAddLessonModal.value)
}
</script>

<style scoped>
.admin-course-lessons {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: var(--secondary-black);
  border: none;
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-lesson-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Course tabs */
.course-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  transition: color 0.3s;
}

.tab:hover {
  color: var(--accent-color);
}

.tab.active {
  color: var(--accent-color);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent-color);
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

.error-icon {
  font-size: 3rem;
  color: var(--error-color);
  margin-bottom: 1rem;
}

.course-info-card {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.course-info-header {
  display: flex;
  align-items: flex-start;
}

.course-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
}

.course-details {
  padding: 1.5rem;
  flex: 1;
}

.course-details h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.instructor {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.course-stats {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--success-color);
  color: var(--text-primary);
}

.status-badge.pending {
  background: var(--warning-color);
  color: var(--text-primary);
}

.status-badge.draft {
  background: var(--tertiary-black);
  color: var(--text-secondary);
}

.status-badge.inactive {
  background: var(--error-color);
  color: var(--text-primary);
}

.lessons-container {
  background: var(--secondary-black);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
}

.lessons-container h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.no-lessons {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-lessons i {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: var(--tertiary-black);
  transition: transform 0.2s ease;
}

.lesson-item:hover {
  transform: translateX(5px);
}

.lesson-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lesson-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: var(--primary-black);
  border-radius: 50%;
  font-weight: bold;
}

.lesson-details h3 {
  margin: 0;
  font-size: 1rem;
}

.lesson-actions {
  display: flex;
  gap: 0.5rem;
}

.lesson-actions button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-btn {
  background: var(--accent-color);
  color: var(--primary-black);
}

.delete-btn {
  background: var(--error-color);
  color: var(--text-primary);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .admin-course-lessons {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .course-info-header {
    flex-direction: column;
  }
  
  .course-image {
    width: 100%;
    height: 200px;
  }
  
  .header-actions {
    align-self: flex-start; /* Align to the start on mobile */
    width: 100%; /* Full width on mobile */
  }
  
  .add-lesson-btn {
    width: 100%; /* Full width button on mobile */
  }
}

/* Modal styles - ensure they're not affected by media queries */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000; /* Increased z-index */
}

.modal-content {
  background: var(--secondary-black);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--tertiary-black);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--tertiary-black);
  color: var(--text-primary);
  cursor: pointer;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--accent-color);
  color: var(--primary-black);
  font-weight: 600;
  cursor: pointer;
}
</style>













