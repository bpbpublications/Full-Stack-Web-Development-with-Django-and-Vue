import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
import Courses from '../components/CourseList.vue'
import CourseDetailPage from '../views/CourseDetailPage.vue'
import UserProfile from '../components/UserProfile.vue'
import Privacy from '../views/Privacy.vue'
import { requireAuth, requireRole } from './guards'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/contact', name: 'Contact', component: Contact },
  { path: '/courses', name: 'Courses', component: Courses },
  { path: '/courses/:id', name: 'CourseDetails', component: CourseDetailPage },
  { path: '/privacy', name: 'Privacy', component: Privacy },
  { path: '/profile', name: 'Profile', component: UserProfile },
  {
    path: '/instructor',
    component: () => import('../views/instructor/InstructorDashboard.vue'),
    meta: { requiresAuth: true, requiresInstructor: true },
    children: [
      {
        path: 'overview',
        name: 'InstructorOverview',
        component: () => import('../views/instructor/Overview.vue')
      },
      {
        path: 'courses',
        name: 'InstructorCourses',
        component: () => import('../views/instructor/Courses.vue')
      },
      {
        path: 'students',
        name: 'InstructorStudents',
        component: () => import('../views/instructor/Students.vue')
      },
      {
        path: 'earnings',
        name: 'InstructorEarnings',
        component: () => import('../views/instructor/Earnings.vue')
      },
      {
        path: 'reviews',
        name: 'InstructorReviews',
        component: () => import('../views/instructor/Reviews.vue')
      },
      {
        path: 'notifications',
        name: 'InstructorNotifications',
        component: () => import('../views/instructor/NotificationCenter.vue')
      },
      {
        path: '',
        redirect: { name: 'InstructorOverview' }
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/StudentDashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'StudentDashboard',
        component: () => import('../views/dashboard/Overview.vue')
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/dashboard/Profile.vue')
      },
      {
        path: 'my-courses',
        name: 'MyCourses',
        component: () => import('../views/dashboard/MyCourses.vue')
      },
      {
        path: 'progress',
        name: 'StudentProgress',
        component: () => import('../views/dashboard/Progress.vue')
      },
      {
        path: 'notifications',
        name: 'StudentNotifications',
        component: () => import('../views/dashboard/Notifications.vue')
      },
      {
        path: 'orders',
        name: 'StudentOrders',
        component: () => import('../views/dashboard/Orders.vue')
      },
      {
        path: 'certificates',
        name: 'StudentCertificates',
        component: () => import('../views/dashboard/Certificates.vue')
      },
      {
        path: '',
        redirect: { name: 'StudentDashboard' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'overview',
        name: 'AdminOverview',
        component: () => import('../views/admin/Overview.vue')
      },
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('../views/admin/Courses.vue')
      },
      {
        path: 'courses/:id',
        name: 'AdminCourseDetails',
        component: () => import('../views/admin/CourseDetails.vue')
      },
      {
        path: 'students',
        name: 'AdminStudents',
        component: () => import('../views/admin/Students.vue')
      },
      {
        path: 'students/:id',
        name: 'AdminStudentDetails',
        component: () => import('../views/admin/StudentDetails.vue')
      },
      {
        path: 'instructors',
        name: 'AdminInstructors',
        component: () => import('../views/admin/Instructors.vue')
      },
      {
        path: 'instructors/:id',
        name: 'AdminInstructorProfile',
        component: () => import('../views/admin/InstructorProfile.vue')
      },
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: () => import('../views/admin/Reports.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue')
      },
      {
        path: 'notifications',
        name: 'AdminNotifications',
        component: () => import('../views/admin/NotificationManagement.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/Settings.vue')
      },
      {
        path: '',
        redirect: { name: 'AdminOverview' }
      }
    ]
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/NotificationsPage.vue')
  }
]

/**
 * Create router instance with specified history mode
 * @param {string} mode - 'web' for production, 'memory' for testing
 * @returns {Router} Vue Router instance
 */
export function createAppRouter(mode = 'web') {
  const history = mode === 'memory' ? createMemoryHistory() : createWebHistory()
  
  const router = createRouter({
    history,
    routes
  })

  // Navigation guards
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (to.meta.requiresAdmin && userStore.role !== 'admin') {
      next({ name: 'Forbidden' })
    } else if (to.meta.requiresInstructor && userStore.role !== 'instructor') {
      next({ name: 'Forbidden' })
    } else {
      next()
    }
  })

  return router
}

/**
 * Production router instance
 */
export const router = createAppRouter('web')

export default router
