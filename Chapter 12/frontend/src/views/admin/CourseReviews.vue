<template>
  <div class="course-reviews">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back to Course
      </button>
      <h2>Reviews for {{ course?.title || 'Course' }}</h2>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading reviews...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchReviews" class="retry-btn">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="reviews.length === 0" class="empty-container">
      <p>No reviews yet for this course.</p>
    </div>

    <!-- Reviews list -->
    <div v-else class="reviews-list">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="user-info">
            <img :src="review.userAvatar || '/default-avatar.jpg'" :alt="review.userName" class="user-avatar">
            <div>
              <h3>{{ review.userName }}</h3>
              <div class="rating">
                <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': n <= review.rating }"></i>
                <span>{{ review.rating }}/5</span>
              </div>
            </div>
          </div>
          <span class="review-date">{{ formatDate(review.date) }}</span>
        </div>
        <p class="review-content">{{ review.content }}</p>
        <div class="review-actions">
          <button @click="respondToReview(review)" class="respond-btn" v-if="!review.response">
            <i class="fas fa-reply"></i> Respond
          </button>
          <button @click="deleteReview(review.id)" class="delete-btn">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
        <div v-if="review.response" class="review-response">
          <div class="response-header">
            <h4>Instructor Response</h4>
            <span class="response-date">{{ formatDate(review.responseDate) }}</span>
          </div>
          <p>{{ review.response }}</p>
          <button @click="editResponse(review)" class="edit-response-btn">
            <i class="fas fa-edit"></i> Edit Response
          </button>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div v-if="showResponseModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditingResponse ? 'Edit Response' : 'Respond to Review' }}</h3>
          <button @click="closeResponseModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="review-preview">
            <div class="user-info">
              <img :src="selectedReview?.userAvatar || '/default-avatar.jpg'" :alt="selectedReview?.userName" class="user-avatar-small">
              <div>
                <h4>{{ selectedReview?.userName }}</h4>
                <div class="rating-small">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': n <= (selectedReview?.rating || 0) }"></i>
                </div>
              </div>
            </div>
            <p class="review-content-preview">{{ selectedReview?.content }}</p>
          </div>
          <div class="form-group">
            <label for="response">Your Response:</label>
            <textarea 
              id="response" 
              v-model="responseText" 
              rows="5" 
              placeholder="Write your response here..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeResponseModal" class="cancel-btn">Cancel</button>
          <button @click="submitResponse" class="submit-btn">
            {{ isEditingResponse ? 'Update Response' : 'Submit Response' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>Delete Review</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this review? This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="confirmDeleteReview" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../../stores/courseStore'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const courseId = route.params.id
const course = ref(null)
const reviews = ref([])
const loading = ref(true)
const error = ref(null)

// Modal state
const showResponseModal = ref(false)
const showDeleteModal = ref(false)
const selectedReview = ref(null)
const responseText = ref('')
const isEditingResponse = ref(false)
const reviewToDelete = ref(null)

// Fetch course details and reviews
const fetchCourseDetails = async () => {
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
  }
}

const fetchReviews = async () => {
  loading.value = true
  error.value = null
  
  try {
    await fetchCourseDetails()
    
    // In a real app, you would fetch reviews from an API
    // For now, we'll use mock data filtered by courseId
    reviews.value = mockReviews.filter(review => review.courseId == courseId)
  } catch (err) {
    console.error('Failed to fetch reviews:', err)
    error.value = 'Failed to load reviews. Please try again.'
  } finally {
    loading.value = false
  }
}

// Navigation
const goBack = () => {
  router.push(`/admin/courses/${courseId}`)
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Review actions
const respondToReview = (review) => {
  selectedReview.value = review
  responseText.value = ''
  isEditingResponse.value = false
  showResponseModal.value = true
}

const editResponse = (review) => {
  selectedReview.value = review
  responseText.value = review.response
  isEditingResponse.value = true
  showResponseModal.value = true
}

const closeResponseModal = () => {
  showResponseModal.value = false
  selectedReview.value = null
  responseText.value = ''
}

const submitResponse = () => {
  if (!responseText.value.trim()) {
    alert('Please enter a response')
    return
  }
  
  // In a real app, you would send this to an API
  const reviewIndex = reviews.value.findIndex(r => r.id === selectedReview.value.id)
  
  if (reviewIndex !== -1) {
    reviews.value[reviewIndex].response = responseText.value
    reviews.value[reviewIndex].responseDate = new Date()
    
    if (!isEditingResponse.value) {
      // If it's a new response, mark as replied
      reviews.value[reviewIndex].replied = true
    }
  }
  
  closeResponseModal()
}

const deleteReview = (reviewId) => {
  reviewToDelete.value = reviewId
  showDeleteModal.value = true
}

const confirmDeleteReview = () => {
  // In a real app, you would send this to an API
  reviews.value = reviews.value.filter(review => review.id !== reviewToDelete.value)
  showDeleteModal.value = false
  reviewToDelete.value = null
}

// Mock reviews data - replace with actual API call
const mockReviews = [
  {
    id: 1,
    courseId: courseId,
    userName: 'John Doe',
    userAvatar: '/avatar1.jpg',
    rating: 5,
    content: 'This course was excellent! I learned so much and the instructor was very clear.',
    date: new Date(2023, 5, 15),
    response: 'Thank you for your kind words! I\'m glad you enjoyed the course.',
    responseDate: new Date(2023, 5, 16),
    replied: true
  },
  {
    id: 2,
    courseId: courseId,
    userName: 'Jane Smith',
    userAvatar: '/avatar2.jpg',
    rating: 4,
    content: 'Great content, but some sections could be more detailed. Overall very good though!',
    date: new Date(2023, 4, 20),
    replied: false
  },
  {
    id: 3,
    courseId: courseId,
    userName: 'Mike Johnson',
    userAvatar: '/avatar3.jpg',
    rating: 3,
    content: 'The course was okay, but I expected more advanced content based on the description. Some topics were too basic.',
    date: new Date(2023, 3, 10),
    replied: false
  }
]

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.course-reviews {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.rating-small {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.fa-star {
  color: var(--text-secondary);
}

.fa-star.filled {
  color: var(--accent-color);
}

.review-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.review-content {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.review-actions {
  display: flex;
  gap: 1rem;
}

.respond-btn, .edit-response-btn {
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

.delete-btn {
  background: var(--error-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-response {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--tertiary-black);
  border-radius: 8px;
  position: relative;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.response-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--accent-color);
}

.response-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.edit-response-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--secondary-black);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.delete-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
}

.review-preview {
  background: var(--tertiary-black);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.review-content-preview {
  margin-top: 1rem;
  margin-bottom: 0;
  font-style: italic;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--tertiary-black);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.cancel-btn {
  background: var(--tertiary-black);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.submit-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

/* Loading and empty states */
.loading-container, .error-container, .empty-container {
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

.retry-btn {
  margin-top: 1rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .course-reviews {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>

