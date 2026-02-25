<template>
  <div>
    <h1>Course Details</h1>

    <p v-if="selectedCourse">Course Name: {{ selectedCourse.name }}</p>
    <p v-else>Select a course to see details</p>
  </div>
</template>

<script>
export default {
  props: {
    selectedCourse: {
      type: Object,
      required: false,
      default: null,
    },
  },
};
</script>

<style scoped>
p {
  font-size: 16px;
  color: gray;
}
</style>
