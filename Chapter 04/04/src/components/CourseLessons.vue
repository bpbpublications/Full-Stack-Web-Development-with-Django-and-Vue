<template>
    <div class="course-lessons">
      <h2>Course Content</h2>
      <div class="lessons-list">
        <div v-for="(lesson, index) in lessons" :key="lesson.id" class="lesson-item">
          <div class="lesson-header" @click="toggleDetail(index)">
            <h3>{{ lesson.title }}</h3>
            <span class="progress-icon" :class="getProgressClass(lesson.status)"></span>
          </div>
          <div v-if="index === activeLesson" class="lesson-detail">
            <p>{{ lesson.summary }}</p>
            <button @click="startLesson(lesson)">Start Lesson</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CourseLessons',
    props: ['lessons'],
    data() {
      return {
        activeLesson: null,
      };
    },
    methods: {
      toggleDetail(index) {
        this.activeLesson = this.activeLesson === index ? null : index;
      },
      getProgressClass(status) {
        return {
          'is-complete': status === 'complete',
          'is-in-progress': status === 'in-progress',
          'is-not-started': status === 'not-started'
        };
      },
      startLesson(lesson) {
        this.$router.push(`/lessons/${lesson.id}`);
      }
    }
  }
  </script>
  
  <style scoped>
  .course-lessons .lessons-list .lesson-item {
    cursor: pointer;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    transition: background-color 0.3s; 
  }
  
  .lesson-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px; 
  }
  
  .lesson-header h3 {
    flex-grow: 1;
  }
  
  .progress-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-left: 10px; 
  }
  
  .is-complete {
    background-color: green;
  }
  
  .is-in-progress {
    background-color: orange;
  }
  
  .is-not-started {
    background-color: grey;
  }
  
  .lesson-detail {
    padding: 10px;
    background-color: #f9f9f9;
    transition: max-height 0.3s; 
  }
  
  .lesson-header:focus {
    background-color: #f0f0f0; 
  }
  
  .lesson-header:focus .progress-icon {
    transform: scale(1.1); 
  }
  </style>
  