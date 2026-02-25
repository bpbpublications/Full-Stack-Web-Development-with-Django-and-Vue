<template>
  <div v-if="course" class="course-detail">
    <div class="course-header">
      <div class="course-info">
        <h1>{{ course.name }}</h1>
        <p class="description">{{ course.description }}</p>
        <div class="meta-info">
          <span class="instructor">
            <i class="fas fa-user"></i> {{ course.instructor }}
          </span>
          <span class="rating">
            <i class="fas fa-star"></i> {{ course.rating }}
          </span>
          <span class="enrolled">
            <i class="fas fa-users"></i> {{ course.enrolled }} students
          </span>
        </div>
      </div>
      <div class="course-action">
        <div class="price-box">
          <img :src="course.image" :alt="course.name" class="course-preview">
          <span class="price">${{ course.price }}</span>
          <button @click="enrollInCourse" class="enroll-button">
            Enroll Now
          </button>
          <div class="features">
            <p><i class="fas fa-infinity"></i> Full lifetime access</p>
            <p><i class="fas fa-mobile-alt"></i> Access on mobile and TV</p>
            <p><i class="fas fa-certificate"></i> Certificate of completion</p>
          </div>
        </div>
      </div>
    </div>

    <div class="course-content">
      <div class="main-content">
        <section class="what-you-learn card">
          <h2>What You'll Learn</h2>
          <ul>
            <li><i class="fas fa-check" style="color: #00FF94"></i>Understanding fundamental concepts</li>
            <li><i class="fas fa-check" style="color: #00FF94"></i>Practical implementation skills</li>
            <li><i class="fas fa-check" style="color: #00FF94"></i>Real-world project experience</li>
            <li><i class="fas fa-check" style="color: #00FF94"></i>Industry best practices</li>
          </ul>
        </section>

        <section class="course-curriculum card">
          <h2>Course Curriculum</h2>
          <div v-for="(section, index) in curriculum" :key="index" class="curriculum-section">
            <div class="section-header" @click="toggleSection(index)">
              <h3>{{ section.title }}</h3>
              <span class="toggle-icon">{{ section.isOpen ? '−' : '+' }}</span>
            </div>
            <div v-show="section.isOpen" class="section-content">
              <ul>
                <li v-for="(lesson, lessonIndex) in section.lessons" :key="lessonIndex">
                  <i class="fas fa-play-circle"></i>
                  <span class="lesson-title">{{ lesson.title }}</span>
                  <span class="lesson-duration">{{ lesson.duration }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="spinner"></div>
    Loading course details...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const course = ref(null)

const curriculum = ref([
  {
    title: 'Getting Started',
    isOpen: true,
    lessons: [
      { title: 'Introduction to the Course', duration: '10:00' },
      { title: 'Setting Up Your Environment', duration: '15:00' }
    ]
  },
  {
    title: 'Basic Concepts',
    isOpen: false,
    lessons: [
      { title: 'Core Principles', duration: '20:00' },
      { title: 'Fundamental Techniques', duration: '25:00' }
    ]
  }
])

onMounted(() => {
  const courseId = parseInt(route.params.id)
  course.value = courseStore.getCourseById(courseId)
  
  if (!course.value) {
    router.push({ name: 'NotFound' })
  }
})

const toggleSection = (index) => {
  curriculum.value[index].isOpen = !curriculum.value[index].isOpen
}

const enrollInCourse = () => {
  // Implement enrollment logic here
  console.log(`Enrolling in course: ${course.value.name}`)
}
</script>

<style scoped>
.course-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-primary);
}

.course-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.course-info h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.meta-info {
  display: flex;
  gap: 2rem;
  color: var(--text-secondary);
}

.price-box {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
}

.course-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.price {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  text-align: center;
}

.enroll-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.enroll-button:hover {
  opacity: 0.9;
}

.features {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--tertiary-black);
}

.features p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.card {
  background: var(--secondary-black);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--tertiary-black);
}

.what-you-learn ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.what-you-learn li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.what-you-learn li i {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-color);
}

.curriculum-section {
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--tertiary-black);
  cursor: pointer;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.toggle-icon {
  font-size: 1.2rem;
  color: var(--accent-color);
}

.section-content {
  padding: 1rem;
}

.section-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-content li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--tertiary-black);
}

.section-content li:last-child {
  border-bottom: none;
}

.lesson-title {
  flex: 1;
}

.lesson-duration {
  margin-left: auto;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.spinner {
  border: 4px solid var(--tertiary-black);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .course-header {
    grid-template-columns: 1fr;
  }
  
  .course-info h1 {
    font-size: 2rem;
  }
  
  .meta-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .what-you-learn ul {
    grid-template-columns: 1fr;
  }
}
</style>




