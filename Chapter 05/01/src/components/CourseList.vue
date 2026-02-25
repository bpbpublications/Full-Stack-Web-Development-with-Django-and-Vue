<template>
  <div class="courses-container">
    <h1>Courses</h1>
    <ul class="courses-list">
      <li
        v-for="course in courses"
        :key="course.id"
        @click="setCurrentCourse(course.id)"
        class="course-item"
      >
        {{ course.name }}

        <button
          v-if="!isEnrolled(course.id)"
          @click.stop="enrollInCourse(course.id)"
          class="enroll-btn"
        >
          Enroll
        </button>

        <span v-else class="enrolled-badge">
          Enrolled
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCourseStore } from "@/stores/courseStore";

const courseStore = useCourseStore();
const { courses } = storeToRefs(courseStore);
const { setCurrentCourse, enrollInCourse, isEnrolled, fetchCourses } = courseStore;

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.courses-container {
  padding: 20px;
}

.courses-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.course-item {
  cursor: pointer;
  padding: 8px 0;
}

.enroll-btn {
  margin-left: 10px;
}

.enrolled-badge {
  margin-left: 10px;
  color: green;
}
</style>
