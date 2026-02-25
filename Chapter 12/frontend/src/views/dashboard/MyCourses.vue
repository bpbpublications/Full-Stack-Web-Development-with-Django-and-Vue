<template>
  <div class="my-courses">
    <h1>My Courses</h1>

    <div class="courses-grid">
      <div v-for="course in enrolledCourses" :key="course.id" class="course-card">
        <img
          :src="getCourseImageUrl(course.thumbnail)"
          :alt="course.title"
          class="course-thumbnail"
          @error="handleCourseImageError"
        >
        <div class="course-content">
          <h3>{{ course.title }}</h3>
          <div class="progress-bar">
            <div 
              class="progress" 
              :style="{ width: `${course.progress}%` }"
              :class="{ completed: course.progress === 100 }"
            ></div>
          </div>
          <div class="progress-text">
            {{ course.progress }}% Complete
          </div>
          <router-link 
            :to="{ name: 'CourseDetails', params: { id: course.id }}" 
            class="continue-btn"
          >
            {{ course.progress === 0 ? 'Start Course' : 'Continue Learning' }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Course image handling methods
const getCourseImageUrl = (thumbnail) => {
  if (thumbnail) {
    // If thumbnail is a full URL, use it directly
    if (thumbnail.startsWith('http')) {
      return thumbnail
    }
    // If thumbnail is a relative path, construct full URL
    if (thumbnail.startsWith('/')) {
      return `http://127.0.0.1:8000${thumbnail}`
    }
    // If thumbnail is just a filename, assume it's in media folder
    return `http://127.0.0.1:8000/media/course-thumbnails/${thumbnail}`
  }
  // Default course image
  return '/src/assets/default-course-image.svg'
}

const handleCourseImageError = (event) => {
  // Fallback to default course image if image fails to load
  event.target.src = '/src/assets/default-course-image.svg'
}

const enrolledCourses = ref([
  {
    id: 1,
    title: 'Introduction to Python Programming',
    thumbnail: '/course-thumbnails/python.jpg',
    progress: 65
  },
  {
    id: 2,
    title: 'Web Development Fundamentals',
    thumbnail: '/course-thumbnails/web-dev.jpg',
    progress: 100
  },
  {
    id: 3,
    title: 'Data Science Basics',
    thumbnail: '/course-thumbnails/data-science.jpg',
    progress: 0
  }
])
</script>

<style scoped>
.my-courses {
  padding: 2rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.course-card {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
}

.course-thumbnail {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-content {
  padding: 1.5rem;
}

.course-content h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.progress-bar {
  height: 8px;
  background: var(--tertiary-black);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

.progress.completed {
  background: #4CAF50;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.continue-btn {
  display: block;
  text-align: center;
  padding: 0.75rem;
  background: var(--accent-color);
  color: var(--primary-black);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: opacity 0.3s ease;
}

.continue-btn:hover {
  opacity: 0.9;
}
</style>