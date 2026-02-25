<script setup>
import CourseList from "./components/CourseList.vue";
import LoggingWrapper from "./components/LoggingWrapper.vue";
import PermissionGate from "./components/PermissionGate.vue";

const userHasPermission = true; 

const courses = [
  { id: 1, name: "Python Essentials for Data Science" },
  { id: 2, name: "Machine Learning Fundamentals" },
];
</script>

<template>
  <div id="app">
    <PermissionGate :is="CourseList" :allowed="userHasPermission" :courses="courses" />

    <LoggingWrapper
      v-if="userHasPermission"
      :is="CourseList"
      name="CourseList"
      :courses="courses"
    />
  </div>
</template>
