<template>
  <div class="reviews">
    <div class="reviews-header">
      <h2>Course Reviews</h2>
      <div class="period-selector">
        <button 
          v-for="period in periods" 
          :key="period"
          :class="['period-btn', { active: selectedPeriod === period }]"
          @click="selectedPeriod = period"
        >
          {{ period }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-star"></i>
          <span>Average Rating</span>
        </div>
        <div class="stat-value">{{ stats.averageRating }}/5.0</div>
        <div class="stat-change">+0.2 from last month</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-users"></i>
          <span>Total Reviews</span>
        </div>
        <div class="stat-value">{{ stats.totalReviews }}</div>
        <div class="stat-change">+24 new reviews</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <i class="fas fa-thumbs-up"></i>
          <span>Satisfaction Rate</span>
        </div>
        <div class="stat-value">{{ stats.positivePercentage }}%</div>
        <div class="stat-change">+2% from last month</div>
      </div>
    </div>

    <div class="card reviews-container">
      <div class="card-header">
        <h3>Recent Reviews</h3>
        <div class="filters">
          <select v-model="selectedCourse" class="filter-select">
            <option value="">All Courses</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>

          <select v-model="selectedRating" class="filter-select">
            <option value="">All Ratings</option>
            <option v-for="rating in [5,4,3,2,1]" :key="rating" :value="rating">
              {{ rating }} Stars
            </option>
          </select>
        </div>
      </div>

      <div class="reviews-list">
        <div v-for="review in filteredReviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="student-info">
              <img :src="review.studentAvatar" :alt="review.studentName" class="student-avatar">
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
          <div class="review-actions" v-if="!review.replied">
            <button @click="reply(review)" class="action-btn">
              <i class="fas fa-reply"></i> Reply
            </button>
          </div>
          <div v-if="review.reply" class="instructor-reply">
            <p><strong>Your reply:</strong> {{ review.reply }}</p>
            <span class="reply-date">{{ formatDate(review.replyDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const periods = ['Week', 'Month', 'Year', 'All Time']
const selectedPeriod = ref('Month')
const selectedCourse = ref('')
const selectedRating = ref('')

const stats = ref({
  averageRating: 4.7,
  totalReviews: 156,
  positivePercentage: 92,
  recentReviews: 24
})

const courses = ref([
  { id: 1, name: 'Advanced Data Science' },
  { id: 2, name: 'Web Development Fundamentals' }
])

const reviews = ref([
  {
    id: 1,
    studentName: 'John Doe',
    studentAvatar: '/avatar1.jpg',
    courseName: 'Advanced Data Science',
    courseId: 1,
    rating: 5,
    content: 'Excellent course! The instructor explained complex concepts in a very clear and understandable way.',
    date: '2023-06-15',
    replied: false
  },
  {
    id: 2,
    studentName: 'Sarah Smith',
    studentAvatar: '/avatar2.jpg',
    courseName: 'Web Development Fundamentals',
    courseId: 2,
    rating: 4,
    content: 'Great course content and structure. Would recommend to beginners.',
    date: '2023-06-14',
    replied: true,
    reply: 'Thank you for your feedback, Sarah! Glad you found the course helpful.',
    replyDate: '2023-06-14'
  }
])

const filteredReviews = computed(() => {
  return reviews.value.filter(review => {
    if (selectedCourse.value && review.courseId !== selectedCourse.value) return false
    if (selectedRating.value && review.rating !== selectedRating.value) return false
    return true
  })
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const reply = (review) => {
  // Implement reply functionality
  console.log('Reply to review:', review.id)
}
</script>

<style scoped>
.reviews {
  padding: 1rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
  background: var(--secondary-black);
  padding: 0.5rem;
  border-radius: 8px;
}

.period-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.period-btn.active {
  background: var(--accent-color);
  color: var(--primary-black);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
}

.stat-change {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.card {
  background: var(--secondary-black);
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--tertiary-black);
}

.reviews-container {
  margin-top: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border-radius: 6px;
  background: var(--tertiary-black);
  border: 1px solid var(--tertiary-black);
  color: var(--text-primary);
  min-width: 150px;
}

.reviews-list {
  padding: 1.5rem;
}

.review-item {
  padding: 1.5rem;
  background: var(--tertiary-black);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  object-fit: cover;
}

.course-name {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.review-rating {
  text-align: right;
}

.stars {
  margin-bottom: 0.25rem;
}

.date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.review-content {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  background: var(--tertiary-black);
  color: var(--text-primary);
  border: 1px solid var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--accent-color);
  color: var(--primary-black);
}

.instructor-reply {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--primary-black);
  border-radius: 6px;
  color: var(--text-secondary);
}

.reply-date {
  display: block;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .reviews-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .period-selector {
    overflow-x: auto;
  }

  .filters {
    flex-direction: column;
  }

  .review-header {
    flex-direction: column;
    gap: 1rem;
  }

  .review-rating {
    text-align: left;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
