<template>
  <div id="app">
    <header>
      <nav>
        <div class="logo">
          Datapundits
        </div>
        <div class="nav-links">
          <router-link :to="{ name: 'Home' }" class="nav-link">Home</router-link>
          <router-link :to="{ name: 'About' }" class="nav-link">About</router-link>
          <router-link :to="{ name: 'Courses' }" class="nav-link">Courses</router-link>
          <router-link :to="{ name: 'Contact' }" class="nav-link">Contact</router-link>
          <router-link :to="{ name: 'Profile' }" class="nav-link">Profile</router-link>
        </div>
      </nav>
    </header>

    <h1 v-if="$route.name !== 'Home'">Learning Management System</h1>

    
  </div>
  <router-view />
</template>

<script>
import { ref } from 'vue';
import UserProfile from './components/UserProfile.vue';
import CourseList from './components/CourseList.vue';
import CourseDetails from './components/CourseDetails.vue';

export default {
  components: {
    UserProfile,
    CourseList,
    CourseDetails,
  },
  setup() {

    const selectedCourse = ref(null);


    const selectCourse = (course) => {
      selectedCourse.value = course;
    };

    return {
      selectedCourse,
      selectCourse,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;

}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #333;
}

.logo {
  margin-right: 20px;
  color: antiquewhite;
  font-weight: 900;
}

.logo img {
  width: 50px;
  height: 50px;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-link {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  background-color: #444;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.nav-link:hover {
  background-color: #555;
}

nav a.router-link-exact-active {
  background-color: #666;
}
</style>
