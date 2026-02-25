<template>
  <div id="app">
    <h1>Datapundits: Learning Management System</h1>

    <UserProfile />

    <CourseList @select="selectCourse" />
  
    <CourseDetails :selectedCourse="selectedCourse" />
  </div>

</template>

<script>
import { ref } from "vue";
import UserProfile from "./components/UserProfile.vue";
import CourseList from "./components/CourseList.vue";
import CourseDetails from "./components/CourseDetails.vue";

export default {
  components: { UserProfile, CourseList, CourseDetails },

  setup() {
    const selectedCourse = ref(null);

    const selectCourse = (course) => {
      selectedCourse.value = course;
    };

    return { selectedCourse, selectCourse };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
