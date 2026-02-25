/**
 * Mock data factories for integration testing
 * These patterns match Django factory-boy generated data
 */

export const mockUserFactory = {
  /**
   * Create a user registration payload
   */
  createUser(overrides = {}) {
    return {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!',
      first_name: 'Test',
      last_name: 'User',
      ...overrides
    }
  },

  /**
   * Create a user login payload
   */
  loginCredentials(overrides = {}) {
    return {
      username: 'testuser',
      password: 'TestPass123!',
      ...overrides
    }
  },

  /**
   * Create a user response (from backend)
   */
  userResponse(overrides = {}) {
    return {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      date_joined: '2026-01-15T00:00:00Z',
      ...overrides
    }
  },

  /**
   * Create an authentication response with token
   */
  authResponse(overrides = {}) {
    return {
      access: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
      refresh: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
      user: this.userResponse(),
      ...overrides
    }
  }
}

export const mockCourseFactory = {
  /**
   * Create a single course response
   */
  createCourse(overrides = {}) {
    return {
      id: 1,
      title: 'Python for Data Science',
      description: 'Learn Python programming for data science applications',
      instructor: 'Dr. Sarah Anderson',
      instructor_id: 1,
      price: 29.99,
      rating: 4.5,
      total_reviews: 120,
      enrolled: 150,
      thumbnail: '/course1.jpg',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
      ...overrides
    }
  },

  /**
   * Create a course list response with pagination
   */
  courseListResponse(count = 2, pageSize = 10, overrides = {}) {
    const courses = []
    const titles = [
      'Python for Data Science',
      'Machine Learning Fundamentals',
      'Advanced Statistics',
      'Data Visualization with Matplotlib'
    ]
    const instructors = [
      'Dr. Sarah Anderson',
      'Prof. Michael Chen',
      'Dr. Emily Watson',
      'Prof. James Kumar'
    ]

    for (let i = 1; i <= Math.min(count, titles.length); i++) {
      courses.push(
        this.createCourse({
          id: i,
          title: titles[i - 1],
          instructor: instructors[i - 1],
          instructor_id: i,
          rating: 4.0 + Math.random() * 1.0,
          total_reviews: Math.floor(Math.random() * 300),
          enrolled: Math.floor(Math.random() * 500),
          price: 29.99 + (i * 10),
          ...overrides
        })
      )
    }

    return {
      count: count,
      next: count > pageSize ? `/api/courses/?page=2` : null,
      previous: null,
      results: courses
    }
  },

  /**
   * Create a course detail response
   */
  courseDetailResponse(overrides = {}) {
    return {
      ...this.createCourse(overrides),
      lessons: [
        { id: 1, title: 'Introduction', order: 1, duration: 10 },
        { id: 2, title: 'Getting Started', order: 2, duration: 20 },
        { id: 3, title: 'Advanced Topics', order: 3, duration: 30 }
      ],
      prerequisites: [],
      learning_outcomes: [
        'Understand Python fundamentals',
        'Apply data science techniques',
        'Build real-world projects'
      ]
    }
  }
}

export const mockEnrollmentFactory = {
  /**
   * Create an enrollment request payload
   */
  createEnrollmentRequest(courseId = 1, overrides = {}) {
    return {
      course_id: courseId,
      ...overrides
    }
  },

  /**
   * Create an enrollment response
   */
  enrollmentResponse(userId = 1, courseId = 1, overrides = {}) {
    return {
      id: 1,
      user_id: userId,
      course_id: courseId,
      enrolled_at: '2026-01-15T10:00:00Z',
      completed_at: null,
      progress: 0,
      is_completed: false,
      certificate_issued: false,
      ...overrides
    }
  },

  /**
   * Create a user's enrolled courses list
   */
  enrolledCoursesResponse(count = 3, overrides = {}) {
    return [
      this.enrollmentResponse(1, 1, {
        course: mockCourseFactory.courseDetailResponse({ id: 1 }),
        progress: 45,
        ...overrides
      }),
      this.enrollmentResponse(1, 2, {
        course: mockCourseFactory.courseDetailResponse({ 
          id: 2, 
          title: 'Machine Learning Fundamentals' 
        }),
        progress: 80,
        ...overrides
      }),
      this.enrollmentResponse(1, 3, {
        course: mockCourseFactory.courseDetailResponse({ 
          id: 3, 
          title: 'Advanced Statistics' 
        }),
        progress: 20,
        ...overrides
      })
    ].slice(0, count)
  }
}

/**
 * Error response factory
 */
export const mockErrorFactory = {
  /**
   * 401 Unauthorized
   */
  unauthorized() {
    return {
      status: 401,
      data: {
        detail: 'Authentication credentials were not provided.'
      }
    }
  },

  /**
   * 403 Forbidden
   */
  forbidden() {
    return {
      status: 403,
      data: {
        detail: 'You do not have permission to perform this action.'
      }
    }
  },

  /**
   * 404 Not Found
   */
  notFound(message = 'Not found.') {
    return {
      status: 404,
      data: {
        detail: message
      }
    }
  },

  /**
   * 409 Conflict (already enrolled)
   */
  conflict(message = 'User is already enrolled in this course.') {
    return {
      status: 409,
      data: {
        detail: message
      }
    }
  },

  /**
   * 400 Bad Request (validation error)
   */
  validationError(field = 'email', message = 'This field is required.') {
    return {
      status: 400,
      data: {
        [field]: [message]
      }
    }
  },

  /**
   * 409 Conflict (email already taken)
   */
  emailTaken() {
    return {
      status: 409,
      data: {
        email: ['A user with that email already exists.']
      }
    }
  }
}
