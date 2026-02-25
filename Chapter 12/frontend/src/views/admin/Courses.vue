<template>
  <div class="courses">
    <div class="header">
      <h2>Course Management</h2>
    </div>

    <div class="filters-container">
      <div class="filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search courses..." 
          class="search-input"
        >
      </div>
      <button class="add-course-btn" @click="showAddCourseModal = true">
        <i class="fas fa-plus"></i> Add Course
      </button>
    </div>

   
    <div v-if="courseStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading courses...</p>
    </div>

 
    <div v-else-if="courseStore.error" class="error-container">
      <p>{{ courseStore.error }}</p>
      <button @click="refreshCourses" class="retry-btn">Retry</button>
    </div>


    <div v-else-if="filteredCourses.length === 0" class="empty-container">
      <p>No courses found. {{ searchQuery ? 'Try a different search term.' : 'Create your first course!' }}</p>
      <button v-if="!searchQuery" @click="showAddCourseModal = true" class="add-course-btn">
        <i class="fas fa-plus"></i> Add Course
      </button>
    </div>


    <div v-else class="courses-grid">
      <div
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card"
        @click="viewCourseDetails(course.id)"
      >
        <img 
          :src="course.thumbnail || course.image || '/default-course.jpg'" 
          :alt="course.title || course.name" 
          class="course-image"
          @error="handleImageError"
          loading="lazy"
        >
        <div class="course-content">
          <div class="course-header">
            <h3>{{ course.title || course.name || 'Untitled Course' }}</h3>
            <span :class="['status-badge', course.status || 'draft']">
              {{ course.status || 'draft' }}
            </span>
          </div>

          <div class="course-stats">
            <span><i class="fas fa-users"></i> {{ course.enrolled || 0 }} students</span>
            <span><i class="fas fa-star"></i> {{ course.rating || 0 }}</span>
          </div>
          <div class="course-actions">
            <button @click.stop="reviewCourse(course.id, $event)" class="review-btn">
              <i class="fas fa-eye"></i> Reviews
            </button>
            <button 
              @click.stop="toggleCourseStatus(course, $event)" 
              :class="['status-btn', course.status === 'inactive' ? 'inactive' : '']"
            >
              <i class="fas" :class="course.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
              {{ course.status === 'active' ? 'Active' : 'Inactive' }}
            </button>
            <button @click.stop="editCourse(course, $event)" class="edit-btn">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button @click.stop="deleteCourse(course.id, $event)" class="delete-btn">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <Teleport to="body">
      <div v-if="showAddCourseModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Edit Course' : 'Add New Course' }}</h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCourse">
              <div class="form-group">
                <label for="courseTitle">Title *</label>
                <input 
                  type="text" 
                  id="courseTitle" 
                  v-model="courseForm.title" 
                  required
                  placeholder="Enter course title"
                >
              </div>
              <div class="form-group">
                <label for="courseSubtitle">Subtitle</label>
                <input 
                  type="text" 
                  id="courseSubtitle" 
                  v-model="courseForm.subtitle" 
                  placeholder="Enter course subtitle"
                >
              </div>
              <div class="form-group">
                <label for="courseDescription">Description</label>
                <textarea 
                  id="courseDescription" 
                  v-model="courseForm.description" 
                  rows="4"
                  placeholder="Enter course description"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="courseImage">Thumbnail</label>
                <input 
                  type="file" 
                  id="courseImage" 
                  @change="handleThumbnailUpload"
                  accept="image/*"
                >
                <p class="form-help">Upload an image for the course thumbnail</p>
                <div v-if="courseForm.thumbnail" class="thumbnail-preview">
                  <img :src="thumbnailPreviewUrl" alt="Thumbnail preview">
                </div>
              </div>
              <div class="form-group">
                <label for="courseLevel">Level</label>
                <select id="courseLevel" v-model="courseForm.level">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div class="form-group">
                <label for="coursePrice">Price</label>
                <input 
                  type="number" 
                  id="coursePrice" 
                  v-model="courseForm.price" 
                  min="0" 
                  step="0.01"
                  placeholder="Enter course price"
                >
              </div>
              <div class="form-group">
                <label for="courseStatus">Status</label>
                <select id="courseStatus" v-model="courseForm.status">
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeModal" :disabled="isSubmitting">Cancel</button>
                <button type="submit" class="save-btn" :disabled="isSubmitting || !courseForm.title">
                  <span v-if="isSubmitting" class="spinner-small"></span>
                  {{ isEditing ? 'Update' : 'Create' }} Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const courseStore = useCourseStore()
const userStore = useUserStore()
const statusFilter = ref('all')
const searchQuery = ref('')
const showAddCourseModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)

const currentThumbnailUrl = ref('')

const courseForm = ref({
  id: null,
  title: '',
  subtitle: '',
  description: '',
  instructor: '',
  thumbnail: '',
  level: 'beginner',
  price: 0,
  status: 'draft',
  lessons: []
})

const refreshCourses = async () => {
  try {
    await courseStore.fetchCourses()

    nextTick(() => {
      coursesList.value = [...courseStore.courses]
    })
  } catch (error) {
    console.error('Failed to fetch courses:', error)
  }
}

const thumbnailPreviewUrl = computed(() => {
  if (courseForm.value.thumbnail instanceof File) {
    return URL.createObjectURL(courseForm.value.thumbnail)
  }
  if (isEditing.value && currentThumbnailUrl.value) {
    return currentThumbnailUrl.value
  }
  return ''
})


const handleThumbnailUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.match('image.*')) {
      alert('Please select an image file')
      event.target.value = ''
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size should not exceed 5MB')
      event.target.value = ''
      return
    }
    courseForm.value.thumbnail = file
  }
}


const handleImageLoad = (event) => {
  event.target.classList.add('loaded')
}

const handleImageError = (event) => {
  event.target.src = '/default-course.jpg'
}

const closeModal = () => {
  showAddCourseModal.value = false
  isEditing.value = false
  resetForm()
}

const resetForm = () => {
  courseForm.value = {
    id: null,
    title: '',
    subtitle: '',
    description: '',
    instructor: '',
    thumbnail: '',
    level: 'beginner',
    price: 0,
    status: 'draft',
    lessons: []
  }
}

const coursesList = shallowRef([])

const filteredCourses = computed(() => {
  if (!Array.isArray(courseStore.courses)) {
    console.warn('courses is not an array:', courseStore.courses)
    return []
  }
  return courseStore.courses
    .filter(course => {
      if (statusFilter.value === 'all') return true
      return course.status === statusFilter.value
    })
    .filter(course => {
      if (!searchQuery.value) return true
      const title = course.title || course.name || ''
      const instructor = course.instructor || ''
      return title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             instructor.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
})


onMounted(async () => {
  console.log('Component mounted')
  if (!userStore.isAuthenticated) {
    console.log('User not authenticated, redirecting to login')
    router.push('/login')
    return
  }
  if (courseStore.courses.length === 0) {
    await refreshCourses()
  }
  nextTick(() => {
    document.querySelectorAll('.course-image').forEach(img => {
      img.addEventListener('load', handleImageLoad)
    })
  })
})

onUnmounted(() => {
  document.querySelectorAll('.course-image').forEach(img => {
    img.removeEventListener('load', handleImageLoad)
  })
  if (courseForm.value.thumbnail instanceof File && thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
  }
})


const viewCourseDetails = (courseId) => {
  router.push(`/admin/courses/${courseId}`)
}

const reviewCourse = (courseId, event) => {
  if (event) event.stopPropagation()
  router.push(`/admin/courses/${courseId}/reviews`)
}

const toggleCourseStatus = async (course, event) => {
  if (event) event.stopPropagation()
  try {
    await courseStore.toggleCourseStatus(course.id)
  } catch (error) {
    console.error('Failed to toggle course status:', error)
  }
}

const editCourse = (course, event) => {
  if (event) event.stopPropagation()
  isEditing.value = true
  courseForm.value = {
    id: course.id,
    title: course.title || course.name || '',
    subtitle: course.subtitle || '',
    description: course.description || '',
    instructor: course.instructor || '',
    thumbnail: '',
    level: course.level || 'beginner',
    price: course.price || 0,
    status: course.status || 'draft',
    lessons: course.lessons || []
  }
  if (course.thumbnail || course.image) {
    thumbnailPreviewUrl.value = course.thumbnail || course.image
  }
  showAddCourseModal.value = true
}

const deleteCourse = async (courseId) => {
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      await courseStore.deleteCourse(courseId)
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }
}

const saveCourse = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    if (!courseForm.value.title) {
      alert('Course title is required')
      isSubmitting.value = false
      return
    }
    if (!courseForm.value.instructor && userStore.user) {
      courseForm.value.instructor = userStore.user.name || ''
    }
    const formData = new FormData()
    Object.keys(courseForm.value).forEach(key => {
      if (key === 'thumbnail') {
        if (courseForm.value[key] instanceof File) {
          formData.append(key, courseForm.value[key])
        }
      } else if (key !== 'lessons') {
        formData.append(key, courseForm.value[key])
      }
    })
    formData.set('price', parseFloat(courseForm.value.price) || 0)
    console.log('Form data prepared for', isEditing.value ? 'update' : 'create')
    if (isEditing.value) {
      await courseStore.updateCourse(courseForm.value.id, formData)
    } else {
      await courseStore.createCourse(formData)
    }
    await refreshCourses()
    resetForm()
    showAddCourseModal.value = false
    isEditing.value = false
  } catch (error) {
    console.error(isEditing.value ? 'Failed to update course:' : 'Failed to create course:', error)
    if (error.response?.data) {
      console.error('Validation errors:', error.response.data)
      let errorMessage = 'Error: '
      if (typeof error.response.data === 'object') {
        Object.entries(error.response.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessage += `${field}: ${messages.join(', ')}\n`
          } else if (typeof messages === 'string') {
            errorMessage += `${field}: ${messages}\n`
          } else if (typeof messages === 'object') {
            Object.entries(messages).forEach(([subField, subMessages]) => {
              errorMessage += `${field}.${subField}: ${subMessages.join(', ')}\n`
            })
          }
        })
      } else {
        errorMessage += error.response.data
      }
      alert(errorMessage)
    } else {
      alert('An error occurred. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.courses {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
}

.header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--text-primary);
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.filter-select,
.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--secondary-black);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-select {
  min-width: 150px;
  flex: 0 0 auto;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.add-course-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-course-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}


@media (max-width: 768px) {
  .courses {
    padding: 1rem;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
  }
  
  .add-course-btn {
    margin-top: 1rem;
    width: 100%;
    justify-content: center;
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  contain: layout style;
  min-height: 200px;
}

.course-card {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transform: translateZ(0);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  will-change: transform;
  contain: content;
  box-sizing: border-box;
}

.course-card:hover {
  transform: translateY(-5px) translateZ(0);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.course-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-color: var(--tertiary-black);
  flex-shrink: 0;
  will-change: opacity;
  transform: translateZ(0);
}

.course-content {
  padding: 1.5rem;
  flex: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.course-header, .instructor, .course-stats, .course-actions {
  flex-shrink: 0;
}

.course-actions {
  margin-top: auto;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
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

.instructor {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.course-stats {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.course-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-btn {
  background: var(--accent-color);
  color: var(--primary-black);
}

.status-btn {
  background: var(--success-color);
  color: var(--text-primary);
}

.status-btn.inactive {
  background: var(--warning-color);
}

.edit-btn {
  background: var(--accent-color);
  color: var(--primary-black);
}

.delete-btn {
  background: var(--error-color);
  color: var(--text-primary);
}

.course-actions button:hover {
  opacity: 0.9;
}

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
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.modal-content {
  background: var(--secondary-black);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.modal-enter-from .modal-content {
  transform: translateY(20px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
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
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  background: var(--primary-black);
  color: var(--text-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  background: var(--tertiary-black);
  color: var(--text-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.save-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}


@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions, .filters {
    width: 100%;
  }
  
  .course-actions {
    flex-wrap: wrap;
  }
  
  .course-actions button {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.save-btn:disabled, .cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background: var(--secondary-black);
  border-radius: 12px;
  margin: 2rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--accent-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.thumbnail-preview {
  margin-top: 0.5rem;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.thumbnail-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-help {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

@keyframes imageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

img[loading] {
  opacity: 0;
}

img.loaded {
  animation: imageFadeIn 0.3s ease forwards;
}

.modal-overlay {
  transition: opacity 0.3s ease;
}

.modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.modal-enter-from .modal-content {
  transform: translateY(20px);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

















