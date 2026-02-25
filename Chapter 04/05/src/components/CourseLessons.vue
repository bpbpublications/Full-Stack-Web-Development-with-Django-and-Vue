<template>
  <div class="lessons-container">
    <h2>Course Lessons</h2>
    <p class="placeholder-text">Lessons content will be displayed here</p>
    
    <div class="lessons-list">
      <div class="lesson-item" v-for="(lesson, index) in lessons" :key="index">
        <h3>{{ lesson.title }}</h3>
        <p>{{ lesson.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const lessons = ref([
  { title: 'Lesson 1: Introduction', description: 'Get started with the basics' },
  { title: 'Lesson 2: Core Concepts', description: 'Learn the fundamental concepts' },
  { title: 'Lesson 3: Advanced Topics', description: 'Explore advanced topics' },
]);
</script>

<style scoped>
.lessons-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.placeholder-text {
  color: #999;
  font-style: italic;
  margin-bottom: 20px;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.lesson-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.lesson-item h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.lesson-item p {
  margin: 0;
  color: #666;
}
</style>
