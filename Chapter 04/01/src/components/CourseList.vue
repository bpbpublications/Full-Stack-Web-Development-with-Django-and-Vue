<script setup>
const props = defineProps({
  courses: {
    type: Array,
    required: true,
  
  },
});

const emit = defineEmits(["select"]);

function selectCourse(course) {
  emit("select", course);
}
</script>

<template>
  <section class="courses-section">
    <h3 class="courses-heading">Available Courses</h3>

    <ul v-if="courses.length" class="courses-list">
      <li
        v-for="course in courses"
        :key="course.id"
        class="course-item"
      >
        <span>{{ course.name }}</span>

        <button type="button" @click="selectCourse(course)">
          View
        </button>
      </li>
    </ul>

    <p v-else class="no-courses">No courses available.</p>
  </section>
</template>

<style scoped>
.courses-section {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.courses-heading {
  margin: 0 0 10px;
}

.courses-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.course-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.no-courses {
  margin: 0;
  color: #666;
}
</style>
