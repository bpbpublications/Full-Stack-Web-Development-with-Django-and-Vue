<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1>Master Your Future with <span class="accent">Datapundits</span></h1>
        <p>Unlock your potential with cutting-edge courses in data science, AI, and technology.</p>
        <router-link to="/courses" class="cta-button">Explore Courses</router-link>
      </div>
    </div>
    
    <div class="featured-courses">
      <h2>Featured Courses</h2>
      <div class="course-grid">
        <div v-for="course in courses" :key="course.id" class="course-card">
          <img :src="course.image || '/default-course.jpg'" :alt="course.name" class="course-image">
          <div class="course-content">
            <h3>{{ course.name }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-meta">
              <span class="instructor">{{ course.instructor }}</span>
              <span class="rating">⭐ {{ course.rating }}</span>
            </div>
            <div class="course-footer">
              <span class="price">${{ course.price }}</span>
              <router-link :to="{ name: 'CourseDetails', params: { id: course.id }}" class="learn-more-btn">
                Learn More
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCourseStore } from '../stores/courseStore'

const courseStore = useCourseStore()
const courses = ref(courseStore.courses)
</script>

<style scoped>
.home {
  width: 100%;
}

.hero {
  background-color: var(--secondary-black);
  margin: -2rem -2rem 4rem -2rem;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.accent {
  color: var(--accent-color);
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  background-color: var(--accent-color);
  color: var(--primary-black);
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.featured-courses {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.featured-courses h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.course-card {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid var(--tertiary-black);
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
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.course-content p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-color);
}

.learn-more-btn {
  background-color: var(--tertiary-black);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.learn-more-btn:hover {
  background-color: var(--accent-color);
  color: var(--primary-black);
}

@media (max-width: 768px) {
  .hero {
    margin: -1rem -1rem 2rem -1rem;
    padding: 4rem 1rem;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero p {
    font-size: 1.1rem;
  }

  .course-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .featured-courses {
    padding: 1rem 0;
  }

  .featured-courses h2 {
    margin-bottom: 2rem;
  }
}
  </style>
