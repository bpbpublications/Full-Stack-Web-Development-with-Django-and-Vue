<template>
  <div class="courses">
    <div class="header">
      <h2>My Courses</h2>
      <button class="create-course-btn"><i class="fas fa-plus"></i> Create New Course</button>
    </div>

    <div class="courses-grid">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <img :src="course.image" :alt="course.name" class="course-image" />
        <div class="course-content">
          <h3>{{ course.name }}</h3>
          <p class="course-description">{{ course.description }}</p>
          <div class="course-stats">
            <span><i class="fas fa-users"></i> {{ course.students }} students</span>
            <span><i class="fas fa-star"></i> {{ course.rating }}</span>
          </div>
          <div class="course-actions">
            <button class="edit-btn">Edit</button>
            <button class="view-btn">View</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const courses = ref([
  {
    id: 1,
    name: 'Advanced Data Science',
    description: 'Learn advanced concepts in data science and machine learning',
    image: '/course1.jpg',
    students: 450,
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Web Development Fundamentals',
    description: 'Master the basics of web development',
    image: '/course2.jpg',
    students: 380,
    rating: 4.7,
  },
]);
</script>

<style scoped>
.courses {
  padding: 2rem;
  min-height: 100%; /* Remove calc since we're inside dashboard container */
  background: var(--primary-bg);
  box-sizing: border-box;
  position: relative; /* Ensure proper positioning */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow);
  border: 1px solid var(--border-color);
}

.header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
}

.create-course-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.course-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px var(--shadow);
  transition: all 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px var(--shadow);
  border-color: var(--accent-color);
}

.course-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-content {
  padding: 1.5rem;
}

.course-description {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.course-stats {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  margin: 1rem 0;
}

.course-actions {
  display: flex;
  gap: 1rem;
}

.edit-btn,
.view-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.edit-btn {
  background: var(--tertiary-black);
  color: var(--text-primary);
}

.view-btn {
  background: var(--accent-color);
  color: var(--primary-black);
}

.edit-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.view-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .courses {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .create-course-btn {
    width: 100%;
    justify-content: center;
  }

  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .course-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .course-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-btn,
  .view-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
