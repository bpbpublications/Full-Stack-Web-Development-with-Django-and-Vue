<template>
  <div class="courses-container">
    <h1>Available Courses</h1>
    <div class="course-grid">
      <div v-for="course in courses" :key="course.id" class="course-card" @click="selectCourse(course)">
        <img :src="course.image || '/default-course.jpg'" :alt="course.name" class="course-image">
        <div class="course-content">
          <h3>{{ course.name }}</h3>
          <p class="instructor">{{ course.instructor }}</p>
          <div class="course-meta">
            <span class="rating">⭐ {{ course.rating }}</span>
            <span class="enrolled">{{ course.enrolled }} students</span>
          </div>
          <p class="price">${{ course.price }}</p>
          <router-link :to="{ name: 'CourseDetails', params: { id: course.id }}" class="view-details">
            View Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCourseStore } from '../stores/courseStore'

const courseStore = useCourseStore()
const courses = courseStore.courses

const selectCourse = (course) => {
  courseStore.selectCourse(course)
}
</script>

<style scoped>
.courses-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.course-card {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid var(--tertiary-black);
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
}

.course-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.course-content {
  padding: 1.5rem;
}

.course-content h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.instructor {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.price {
  color: var(--accent-color);
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.view-details {
  display: block;
  background-color: var(--accent-color);
  color: var(--primary-black);
  text-align: center;
  padding: 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.3s ease;
}

.view-details:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
}
</style>
