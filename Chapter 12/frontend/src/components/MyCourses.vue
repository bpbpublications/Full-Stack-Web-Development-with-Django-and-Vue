<template>
  <div class="my-courses">
    <h2>My Courses</h2>
    
    <div class="courses-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="courses-grid">
      <div v-for="course in filteredCourses" :key="course.id" class="course-card card">
        <img :src="course.image" :alt="course.name" class="course-image">
        <div class="course-content">
          <h3>{{ course.name }}</h3>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${course.progress}%` }"></div>
          </div>
          <div class="progress-info">
            <span>{{ course.progress }}% Complete</span>
            <span>{{ course.completedLessons }}/{{ course.totalLessons }} Lessons</span>
          </div>
          <router-link :to="`/course/${course.id}`" class="continue-btn">
            Continue Learning
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('in-progress')
const courseImage = new URL('@assets/pundits.png', import.meta.url).href

const tabs = [
  { id: 'in-progress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
  { id: 'archived', name: 'Archived' }
]

const courses = ref([
  {
    id: 1,
    name: 'Advanced Data Science',
    image: courseImage,
    progress: 45,
    completedLessons: 5,
    totalLessons: 12,
    status: 'in-progress'
  },
  {
    id: 2,
    name: 'Pandas Fundamentals',
    image: courseImage,
    progress: 100,
    completedLessons: 10,
    totalLessons: 10,
    status: 'completed'
  },
  // Add more courses...
])

const filteredCourses = computed(() => {
  return courses.value.filter(course => course.status === activeTab.value)
})
</script>

<style scoped>
.my-courses {
  max-width: 1000px;
  margin: 0 auto;
}

h2 {
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.courses-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: var(--secondary-black);
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: var(--accent-color);
  color: var(--primary-black);
  border-color: var(--accent-color);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
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

.course-content h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
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

.progress-info {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.continue-btn {
  display: block;
  background: var(--accent-color);
  color: var(--primary-black);
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.3s;
}

.continue-btn:hover {
  opacity: 0.9;
}
</style>