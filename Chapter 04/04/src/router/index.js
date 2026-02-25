import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Contact from '../views/Contact.vue';
import Courses from '../components/CourseList.vue';
import CourseDetails from '../components/CourseDetails.vue';
import UserProfile from '../components/UserProfile.vue';
import CourseInquiryForm from '../components/CourseInquiryForm.vue';
import Login from '../components/Login.vue';
import RegisterForm from '../components/RegisterForm.vue';


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/about', name: 'About', component: About },
    { path: '/contact', name: 'Contact', component: Contact },
    { path: '/courses', name: 'Courses', component: Courses },
    { path: '/courses-inquiry', name: 'CourseInquiryForm', component: CourseInquiryForm },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'RegisterForm', component: RegisterForm },
    {
      path: '/courses/:id', name: 'CourseDetails', component: CourseDetails,
      children: [
        { path: 'overview', name: 'CourseOverview', component: () => import('../components/CourseOverview.vue') },
        { path: 'lessons', name: 'CourseLessons', component: () => import('../components/CourseLessons.vue') },
        { path: 'ratings', name: 'CourseRatings', component: () => import('../components/CourseRatings.vue') },

      ]
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue')
    },
    { path: '/profile', name: 'Profile', component: UserProfile }
  ]
});

export default router;
