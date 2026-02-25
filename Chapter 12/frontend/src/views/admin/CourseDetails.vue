<template>
  <div class="course-details">
    <div class="header">
      <div class="course-actions">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i> Back to Courses
        </button>
        <div class="action-buttons">
          <button @click="editCourse" class="edit-btn">
            <i class="fas fa-edit"></i> Edit Course
          </button>
        </div>
      </div>
    </div>

    <!-- Course navigation tabs -->
    <div class="course-tabs">
      <div class="tab active">Overview</div>
      <div class="tab" @click="goToLessons">Lessons</div>
      <div class="tab" @click="goToReviews">Reviews</div>
      <div class="tab" @click="goToStudents">Students</div>
    </div>

    <!-- Course content -->
    <div class="course-content">
      <div class="course-header">
        <img 
          :src="course?.image || '/default-course.jpg'" 
          :alt="course?.name" 
          class="course-image"
          @error="handleImageError"
        >
        <div class="course-info">
          <h1>{{ course?.name || 'Course Details' }}</h1>
          <p class="instructor">Instructor: {{ course?.instructor || 'Unknown' }}</p>
          <div class="course-stats">
            <span class="stat"><i class="fas fa-users"></i> {{ course?.enrolled || 0 }} students</span>
            <span class="stat"><i class="fas fa-star"></i> {{ course?.rating || 0 }} rating</span>
            <span class="stat"><i class="fas fa-dollar-sign"></i> {{ course?.price || 0 }}</span>
          </div>
          <div class="course-actions-row">
            <button @click="goToLessons" class="action-button lessons-btn">
              <i class="fas fa-list"></i> Manage Lessons
            </button>
            <button @click="goToReviews" class="action-button reviews-btn">
              <i class="fas fa-star"></i> View Reviews
            </button>
            <button @click="goToStudents" class="action-button students-btn">
              <i class="fas fa-users"></i> View Students
            </button>
          </div>
        </div>
      </div>

      <!-- Course description -->
      <div class="course-description">
        <h2>Description</h2>
        <p>{{ course?.description || 'No description available.' }}</p>
      </div>

      <!-- Course lessons preview -->
      <div class="course-lessons">
        <div class="section-header">
          <h2>Lessons</h2>
          <button @click="goToLessons" class="view-lessons-btn">
            <i class="fas fa-list"></i> Manage Lessons
          </button>
        </div>
        <div v-if="course?.lessons && course.lessons.length > 0" class="lessons-list">
          <div v-for="(lesson, index) in course.lessons" :key="index" class="lesson-item">
            <span class="lesson-number">{{ index + 1 }}</span>
            <span class="lesson-title">{{ lesson }}</span>
          </div>
        </div>
        <div v-else class="no-lessons">
          <p>No lessons available for this course.</p>
          <button @click="goToLessons" class="add-lesson-btn">
            <i class="fas fa-plus"></i> Add First Lesson
          </button>
        </div>
      </div>

      <!-- Course reviews preview -->
      <div class="course-reviews">
        <div class="section-header">
          <h2>Reviews</h2>
          <button @click="goToReviews" class="view-reviews-btn">
            <i class="fas fa-star"></i> View All Reviews
          </button>
        </div>
        <div class="reviews-preview">
          <p>{{ course?.reviews?.length || 0 }} reviews for this course</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const courseId = route.params.id
const course = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchCourseDetails = async () => {
  loading.value = true
  error.value = null
  
  try {
    // First check if the course is already in the store
    if (courseStore.courses.length > 0) {
      course.value = courseStore.courses.find(c => c.id == courseId)
    }
    
    // If not found in store, fetch it
    if (!course.value) {
      await courseStore.fetchCourse(courseId)
      course.value = courseStore.currentCourse
    }
  } catch (err) {
    console.error('Failed to fetch course details:', err)
    error.value = 'Failed to load course details. Please try again.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/admin/courses')
}

const editCourse = () => {
  router.push(`/admin/courses/edit/${courseId}`)
}

const goToLessons = () => {
  router.push(`/admin/courses/${courseId}/lessons`)
}

const goToReviews = () => {
  router.push(`/admin/courses/${courseId}/reviews`)
}

const goToStudents = () => {
  router.push(`/admin/courses/${courseId}/students`)
}

const handleImageError = (event) => {
  event.target.src = '/default-course.jpg'
}

onMounted(() => {
  fetchCourseDetails()
})
</script>

<style scoped>
.course-details {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--secondary-black);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--tertiary-black);
}

.edit-btn {
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

/* Course content */
.course-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.course-header {
  display: flex;
  gap: 2rem;
}

.course-image {
  width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.course-info h1 {
  margin: 0;
  font-size: 1.8rem;
}

.instructor {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.course-stats {
  display: flex;
  gap: 1.5rem;
  margin: 0.5rem 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

/* Improved action buttons */
.course-actions-row {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-button {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.95rem;
}

.lessons-btn {
  background: var(--accent-color);
  color: var(--primary-black);
}

.lessons-btn:hover {
  background: #ffcc00; /* Slightly darker shade */
}

.reviews-btn {
  background: var(--secondary-black);
  color: var(--text-primary);
  border: 1px solid var(--accent-color);
}

.reviews-btn:hover {
  background: var(--tertiary-black);
}

.students-btn {
  background: var(--secondary-black);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.students-btn:hover {
  background: var(--tertiary-black);
}

/* Course sections */
.course-description, .course-lessons, .course-reviews {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

/* Improved section action buttons */
.view-lessons-btn, .view-reviews-btn, .add-lesson-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-lessons-btn:hover, .view-reviews-btn:hover, .add-lesson-btn:hover {
  background: #ffcc00; /* Slightly darker shade */
}

/* Lessons list */
.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--tertiary-black);
  transition: background 0.2s ease;
}

.lesson-item:hover {
  background: var(--primary-black);
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

.lesson-title {
  font-weight: 500;
}

.no-lessons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

/* Reviews preview */
.reviews-preview {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
  }
  
  .course-image {
    width: 100%;
    height: 200px;
  }
  
  .course-actions-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>


