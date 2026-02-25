import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
import Courses from '../components/CourseList.vue'
import CourseDetailPage from '../views/CourseDetailPage.vue'
import UserProfile from '../components/UserProfile.vue'
import Privacy from '../views/Privacy.vue'
import { requireAuth, requireRole } from './guards'

const router = createRouter({
    history: createWebHistory(),
    routes: [
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
            component: () =>
                import ('../views/NotFound.vue')
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
                    name: 'Progress',
                    component: () => import('../views/dashboard/Progress.vue')
                },
                {
                    path: 'notifications',
                    name: 'Notifications',
                    component: () => import('../views/dashboard/Notifications.vue')
                },
                {
                    path: 'orders',
                    name: 'Orders',
                    component: () => import('../views/dashboard/Orders.vue')
                },
                {
                    path: 'certificates',
                    name: 'Certificates',
                    component: () => import('../views/dashboard/Certificates.vue')
                }
            ]
        },
        // Admin routes
        {
            path: '/admin',
            component: () => import('../views/admin/AdminDashboard.vue'),
            meta: { requiresAuth: true, requiresAdmin: true },
            children: [
                {
                    path: '',
                    redirect: '/admin/dashboard'
                },
                {
                    path: 'dashboard',
                    name: 'AdminDashboard',
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
                    path: 'courses/:id/lessons',
                    name: 'AdminCourseLessons',
                    component: () => import('../views/admin/CourseLessons.vue'),
                    props: true,
                    beforeEnter: requireRole(['admin', 'instructor'])
                },
                {
                    path: 'instructors',
                    name: 'AdminInstructors',
                    component: () => import('../views/admin/Instructors.vue')
                },
                {
                    path: 'instructors/:id',
                    name: 'AdminInstructorProfile',
                    component: () => import('../views/admin/InstructorProfile.vue'),
                    props: true
                },
                {
                    path: 'students',
                    name: 'AdminStudents',
                    component: () => import('../views/admin/Students.vue')
                },
                {
                    path: 'students/:id',
                    name: 'AdminStudentDetails',
                    component: () => import('../views/admin/StudentDetails.vue'),
                    props: true
                },
                {
                    path: 'students/edit/:id',
                    name: 'AdminStudentEdit',
                    component: () => import('../views/admin/StudentEdit.vue'),
                    props: true
                },
                {
                    path: 'reports',
                    name: 'AdminReports',
                    component: () => import('../views/admin/Reports.vue')
                },
                {
                    path: 'users',
                    name: 'AdminUsers',
                    component: () => import('../views/admin/Users.vue')
                },
                {
                    path: 'settings',
                    name: 'AdminSettings',
                    component: () => import('../views/admin/Settings.vue')
                }
            ]
        },
        // Add a forbidden route
        {
            path: '/forbidden',
            name: 'forbidden',
            component: () => import('../views/Forbidden.vue')
        }
    ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    console.log('Navigation guard - Current route:', to.fullPath)
    console.log('Navigation guard - User state:', {
        role: userStore.user.role,
        isAdmin: userStore.isAdmin,
        isAuthenticated: userStore.isAuthenticated
    })
    
    // Check if route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!userStore.isAuthenticated) {
            console.log('User not authenticated, redirecting to login')
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        // Check for admin routes
        if (to.matched.some(record => record.meta.requiresAdmin)) {
            console.log('Checking admin access:', userStore.isAdmin)
            if (!userStore.isAdmin) {
                console.log('User is not admin, redirecting to home')
                next({ name: 'Home' })
                return
            }
        }

        // Check for instructor routes
        if (to.matched.some(record => record.meta.requiresInstructor)) {
            if (!userStore.isInstructor) {
                next({ name: 'Home' })
                return
            }
        }
    }
    
    console.log('Navigation allowed to:', to.fullPath)
    next()
})

export default router
