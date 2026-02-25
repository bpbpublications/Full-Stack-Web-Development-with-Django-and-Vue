import { defineStore } from "pinia";

export const useCourseStore = defineStore("courseStore", {
  state: () => ({
    courses: [
      { id: 1, name: "Pandas Fundamentals", enrolled: false },
      { id: 2, name: "Advanced Data Analysis", enrolled: false },
      { id: 3, name: "Fundamentals of Machine Learning", enrolled: false },
      { id: 4, name: "Deep Learning with Python", enrolled: false },
      { id: 5, name: "Web Scraping with BeautifulSoup", enrolled: false },
    ],
    currentCourse: null,
  }),

  getters: {
    isEnrolled: (state) => (courseId) =>
      state.courses.some(
        (course) => course.id === courseId && course.enrolled
      ),
  },

  actions: {
    fetchCourses() {

      console.log("Mocked courses loaded:", this.courses);
    },

    enrollInCourse(courseId) {
      const enrolledCourse = this.courses.find(
        (course) => course.id === courseId
      );

      if (enrolledCourse) {
        enrolledCourse.enrolled = true;
        console.log(`Successfully enrolled in course: ${enrolledCourse.name}`);
      }
    },

    setCurrentCourse(courseId) {
      this.currentCourse = this.courses.find(
        (course) => course.id === courseId
      );
      console.log("Current course set to:", this.currentCourse);
    },
  },
});

