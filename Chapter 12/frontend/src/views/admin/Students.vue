<template>
  <div class="admin-students">
    <div class="header student-page-header">
      <h1 class="page-title">Student Management</h1>
      <div class="header-actions">
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search students..."
            class="search-input"
          >
        </div>
        <div class="export-buttons">
          <button @click="exportToCSV" class="export-btn">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button @click="exportToExcel" class="export-btn">
            <i class="fas fa-file-excel"></i> Export Excel
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <h3>Total Students</h3>
        <p class="stat-value">{{ stats.totalStudents }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Learners</h3>
        <p class="stat-value">{{ stats.activeLearners }}</p>
      </div>
      <div class="stat-card">
        <h3>Course Completions</h3>
        <p class="stat-value">{{ stats.completions }}</p>
      </div>
      <div class="stat-card">
        <h3>Avg. Course Progress</h3>
        <p class="stat-value">{{ stats.avgProgress }}%</p>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedStudents.length > 0" class="bulk-actions">
      <div class="bulk-info">
        <span>{{ selectedStudents.length }} student(s) selected</span>
      </div>
      <div class="bulk-buttons">
        <button @click="bulkActivateStudents" class="bulk-btn activate">
          <i class="fas fa-check"></i> Activate Selected
        </button>
        <button @click="bulkDeactivateStudents" class="bulk-btn deactivate">
          <i class="fas fa-ban"></i> Deactivate Selected
        </button>
        <button @click="bulkDeleteStudents" class="bulk-btn delete">
          <i class="fas fa-trash"></i> Delete Selected
        </button>
        <button @click="clearSelection" class="bulk-btn clear">
          <i class="fas fa-times"></i> Clear Selection
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="studentStore.loading" class="loading-indicator">
      <span>Loading students...</span>
    </div>
    
    <!-- Students table with transition -->
    <div class="students-table" v-else>
      <TransitionGroup name="fade" tag="table">
        <thead key="thead">
          <tr>
            <th class="checkbox-column">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="bulk-checkbox"
              >
            </th>
            <th @click="sortBy('name')" class="sortable" :class="{ 'sorted': sortField === 'name' }">
              Student
              <i v-if="sortField === 'name'" :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="sortBy('enrolledCourses')" class="sortable" :class="{ 'sorted': sortField === 'enrolledCourses' }">
              Enrolled Courses
              <i v-if="sortField === 'enrolledCourses'" :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="sortBy('progress')" class="sortable" :class="{ 'sorted': sortField === 'progress' }">
              Progress
              <i v-if="sortField === 'progress'" :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="sortBy('lastActive')" class="sortable" :class="{ 'sorted': sortField === 'lastActive' }">
              Last Active
              <i v-if="sortField === 'lastActive'" :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="sortBy('status')" class="sortable" :class="{ 'sorted': sortField === 'status' }">
              Status
              <i v-if="sortField === 'status'" :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              <i v-else class="fas fa-sort"></i>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody key="tbody">
          <tr v-for="student in filteredStudents" :key="student.id">
            <td class="checkbox-column">
              <input
                type="checkbox"
                :checked="selectedStudents.includes(student.id)"
                @change="toggleStudentSelection(student.id)"
                class="bulk-checkbox"
              >
            </td>
            <td>
              <div class="student-info">
                <div class="student-avatar" :style="{ backgroundImage: `url(${student.avatar || getDefaultAvatar(student.name)})` }">
                  <span v-if="!student.avatar" class="avatar-initials">{{ getInitials(student.name) }}</span>
                </div>
                <div>
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-email">{{ student.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ student.enrolledCourses }}</td>
            <td>
              <div class="progress-bar">
                <div 
                  class="progress" 
                  :style="{ width: `${student.progress}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ student.progress }}%</span>
            </td>
            <td>{{ formatDate(student.lastActive) }}</td>
            <td>
              <span :class="['status-badge', student.status]">
                {{ student.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewDetails(student.id)" class="view-btn">
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="toggleStatus(student.id)" 
                  :class="['status-btn', student.status]"
                >
                  <i class="fas fa-power-off"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </TransitionGroup>
      
      <!-- Pagination controls -->
      <div class="pagination">
        <button 
          @click="changePage(studentStore.pagination.currentPage - 1)"
          :disabled="studentStore.pagination.currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          Page {{ studentStore.pagination.currentPage }} of {{ studentStore.pagination.totalPages }}
        </span>
        
        <button 
          @click="changePage(studentStore.pagination.currentPage + 1)"
          :disabled="studentStore.pagination.currentPage === studentStore.pagination.totalPages"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Student Details Modal -->
  <div v-if="showStudentModal" class="modal-overlay" @click="closeStudentModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Student Details</h2>
        <button class="close-btn" @click="closeStudentModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body" v-if="selectedStudent">
        <div class="student-profile">
          <div class="profile-header">
            <div class="student-avatar-large" :style="{ backgroundImage: `url(${selectedStudent.avatar || getDefaultAvatar(selectedStudent.name)})` }">
              <span v-if="!selectedStudent.avatar" class="avatar-initials large">{{ getInitials(selectedStudent.name) }}</span>
            </div>
            <div class="profile-info">
              <input v-model="editedStudent.name" class="edit-input name-input" placeholder="Student Name">
              <input v-model="editedStudent.email" class="edit-input email-input" placeholder="Email Address">
              <div class="status-toggle">
                <span>Status:</span>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="statusToggle" 
                    :checked="editedStudent.status === 'active'"
                    @change="editedStudent.status = $event.target.checked ? 'active' : 'inactive'"
                  >
                  <label for="statusToggle"></label>
                </div>
                <span :class="['status-text', editedStudent.status]">{{ editedStudent.status }}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-label">Enrolled Courses</span>
              <span class="stat-value">{{ selectedStudent.enrolledCourses }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Progress</span>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: `${selectedStudent.progress}%` }"></div>
                </div>
                <span class="progress-text">{{ selectedStudent.progress }}%</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="stat-label">Last Active</span>
              <span class="stat-value">{{ formatDate(selectedStudent.lastActive) }}</span>
            </div>
          </div>

          <!-- Enrollment Management Section -->
          <div class="enrollment-section">
            <h3>Course Enrollment</h3>
            <div class="enrollment-controls">
              <select v-model="selectedCourseId" class="course-select" @change="console.log('Course selected:', selectedCourseId)">
                <option value="">Select a course to enroll</option>
                <option v-for="course in availableCourses" :key="course.id" :value="course.id">
                  {{ course.title }}
                </option>
              </select>
              <button
                @click="enrollStudentInCourse"
                :disabled="!selectedCourseId"
                class="enroll-btn"
                type="button"
              >
                <i class="fas fa-plus"></i> Enroll
              </button>
            </div>

            <!-- Current Enrollments -->
            <div class="current-enrollments" v-if="selectedStudent.enrollments && selectedStudent.enrollments.length > 0">
              <h4>Current Enrollments</h4>
              <div class="enrollment-list">
                <div
                  v-for="enrollment in selectedStudent.enrollments"
                  :key="enrollment.id"
                  class="enrollment-item"
                >
                  <div class="enrollment-info">
                    <span class="course-title">{{ enrollment.courseTitle }}</span>
                    <span class="enrollment-status" :class="enrollment.status">{{ enrollment.status }}</span>
                  </div>
                  <div class="enrollment-actions">
                    <button
                      @click="unenrollStudentFromCourse(enrollment.id)"
                      class="unenroll-btn"
                      title="Unenroll from course"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="save-btn" @click="saveStudentChanges">
              <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="delete-btn" @click="confirmDeleteStudent">
              <i class="fas fa-trash"></i> Delete Student
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
    <div class="modal-content delete-modal" @click.stop>
      <div class="modal-header">
        <h2>Confirm Delete</h2>
        <button class="close-btn" @click="showDeleteModal = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this student? This action cannot be undone.</p>
        <div class="confirm-buttons">
          <button class="cancel-btn" @click="showDeleteModal = false">
            Cancel
          </button>
          <button class="confirm-delete-btn" @click="deleteStudent">
            Delete Student
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '../../stores/studentStore'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const studentStore = useStudentStore()
const { showToast } = useToast()

const statusFilter = ref('all')
const searchQuery = ref('')
const isLoading = ref(false)
const showStudentModal = ref(false)
const showDeleteModal = ref(false)
const selectedStudent = ref(null)
const editedStudent = ref(null)
const sortField = ref('name')
const sortDirection = ref('asc')
const selectedCourseId = ref('')
const selectedStudents = ref([])
const availableCourses = ref([
  { id: 1, title: 'Introduction to Data Science' },
  { id: 2, title: 'Advanced Python Programming' },
  { id: 3, title: 'Machine Learning Fundamentals' },
  { id: 4, title: 'Web Development Bootcamp' },
  { id: 5, title: 'Database Design and SQL' }
])

// Computed property for bulk selection
const allSelected = computed(() => {
  return filteredStudents.value.length > 0 &&
         filteredStudents.value.every(student => selectedStudents.value.includes(student.id))
})

// Computed property to get filtered and sorted students from the store
const filteredStudents = computed(() => {
  const filtered = studentStore.getFilteredStudents(statusFilter.value, searchQuery.value)

  // Apply sorting
  return [...filtered].sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    // Handle different data types
    if (sortField.value === 'lastActive') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    let comparison = 0
    if (aValue > bValue) comparison = 1
    if (aValue < bValue) comparison = -1

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

// Computed property to access stats from the store
const stats = computed(() => studentStore.stats)

// Load students and stats when component mounts
onMounted(async () => {
  try {
    console.log('Students component mounted, fetching data...')

    // First fetch the students list with any existing filters
    await studentStore.fetchStudents({
      status: statusFilter.value,
      search: searchQuery.value
    })
    console.log('Students fetched successfully')

    // Load any saved enrollment data from localStorage
    loadSavedEnrollments()

    // Then fetch detailed stats
    await studentStore.fetchStudentStats()
    console.log('Student stats fetched successfully')

    // Sync the component's filter values with the store's current filters
    statusFilter.value = studentStore.currentFilters.status
    searchQuery.value = studentStore.currentFilters.search

    // Log the final stats for debugging
    console.log('Final stats after both API calls:', studentStore.stats)
  } catch (error) {
    console.error('Failed to initialize student data:', error)
    showToast('Failed to load student data', 'error')
  }
})

// Add a watcher to update stats when filters change
watch([statusFilter, searchQuery], async (newValues, oldValues) => {
  // Only refetch if values actually changed
  if (newValues[0] === oldValues[0] && newValues[1] === oldValues[1]) return
  
  try {
    console.log('Filters changed, refetching students with:', {
      status: statusFilter.value,
      search: searchQuery.value
    })
    
    // When filters change, refetch students with the new filters
    await studentStore.fetchStudents({
      status: statusFilter.value,
      search: searchQuery.value
    })
    
    // Optionally refetch stats if they should change based on filters
    // await studentStore.fetchStudentStats()
  } catch (error) {
    console.error('Error applying filters:', error)
    showToast('Failed to apply filters', 'error')
  }
})

const changePage = async (newPage) => {
  // Set local loading state to true before changing page
  isLoading.value = true
  
  // Add a small delay to ensure smooth transition
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Change the page
  await studentStore.changePage(newPage)
  
  // Reset loading state
  isLoading.value = false
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewDetails = (studentId) => {
  // Find the student in the store
  const student = studentStore.students.find(s => s.id === studentId)
  if (student) {
    // Set the selected student and create a copy for editing
    selectedStudent.value = { ...student }
    editedStudent.value = { ...student }

    // Reset enrollment selection
    selectedCourseId.value = ''

    console.log('Opening modal for student:', student)
    console.log('Student enrollments:', student.enrollments)

    showStudentModal.value = true
  }
}

const closeStudentModal = () => {
  showStudentModal.value = false
  selectedStudent.value = null
  editedStudent.value = null
}

const saveStudentChanges = async () => {
  if (!editedStudent.value) return

  try {
    // Preserve enrollments before updating
    const originalEnrollments = selectedStudent.value.enrollments || []

    await studentStore.updateStudent({
      id: editedStudent.value.id,
      name: editedStudent.value.name,
      email: editedStudent.value.email,
      is_active: editedStudent.value.status === 'active'
    })

    // Update the student in the main list to reflect changes immediately
    const studentIndex = studentStore.students.findIndex(s => s.id === editedStudent.value.id)
    if (studentIndex !== -1) {
      studentStore.students[studentIndex] = {
        ...studentStore.students[studentIndex],
        name: editedStudent.value.name,
        email: editedStudent.value.email,
        status: editedStudent.value.status,
        enrollments: originalEnrollments // Preserve enrollments
      }
    }

    // Update the selected student with the edited values and preserve enrollments
    selectedStudent.value = {
      ...editedStudent.value,
      enrollments: originalEnrollments
    }

    // Show success toast
    showToast(`${editedStudent.value.name}'s record has been updated`, 'success')

    // Close the modal
    closeStudentModal()

    // Refresh the student list to ensure consistency
    await refreshStudents()
  } catch (error) {
    console.error('Failed to update student:', error)
    showToast('Failed to update student record', 'error')
  }
}

const confirmDeleteStudent = () => {
  showDeleteModal.value = true
}

const deleteStudent = async () => {
  if (!selectedStudent.value) return
  
  try {
    await studentStore.deleteStudent(selectedStudent.value.id)
    
    // Close both modals
    showDeleteModal.value = false
    showStudentModal.value = false
    
    // Show success message
    alert('Student deleted successfully')
  } catch (error) {
    console.error('Failed to delete student:', error)
    alert('Failed to delete student')
  }
}

const toggleStatus = async (studentId) => {
  try {
    // Find the student to get their name
    const student = studentStore.students.find(s => s.id === studentId)
    if (!student) {
      console.error('Student not found:', studentId)
      showToast('Student not found', 'error')
      return
    }

    // Get the current status before toggling
    const currentStatus = student.status
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

    console.log(`Toggling student ${student.name} (${studentId}) from ${currentStatus} to ${newStatus}`)

    // Update the status immediately in the UI
    student.status = newStatus

    // Toggle the status in the store
    await studentStore.toggleStudentStatus(studentId)

    // Show success toast with student name and new status
    showToast(
      `${student.name}'s status changed to ${newStatus}`,
      'success'
    )

    // Refresh the data to ensure consistency
    await refreshStudents()
  } catch (error) {
    console.error('Failed to toggle student status:', error)
    // Revert the status change if API call failed
    student.status = currentStatus
    showToast('Failed to update student status', 'error')
  }
}

const refreshStudents = async () => {
  try {
    console.log('Refreshing students with current filters:', {
      status: statusFilter.value,
      search: searchQuery.value
    })

    await studentStore.fetchStudents({
      status: statusFilter.value,
      search: searchQuery.value
    }, studentStore.pagination.currentPage)

    await studentStore.fetchStudentStats()

    showToast('Student data refreshed', 'success')
  } catch (error) {
    console.error('Failed to refresh students:', error)
    showToast('Failed to refresh student data', 'error')
  }
}

// Sorting functionality
const sortBy = (field) => {
  if (sortField.value === field) {
    // Toggle direction if same field
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Set new field and default to ascending
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Export functionality
const exportToCSV = () => {
  try {
    const students = filteredStudents.value
    if (students.length === 0) {
      showToast('No students to export', 'warning')
      return
    }

    // Create CSV headers
    const headers = ['Name', 'Email', 'Enrolled Courses', 'Progress (%)', 'Last Active', 'Status']

    // Create CSV rows
    const rows = students.map(student => [
      student.name,
      student.email,
      student.enrolledCourses,
      student.progress,
      formatDate(student.lastActive),
      student.status
    ])

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Students exported to CSV successfully', 'success')
  } catch (error) {
    console.error('Failed to export CSV:', error)
    showToast('Failed to export CSV', 'error')
  }
}

const exportToExcel = () => {
  try {
    const students = filteredStudents.value
    if (students.length === 0) {
      showToast('No students to export', 'warning')
      return
    }

    // For now, we'll export as CSV with .xlsx extension
    // In a real application, you'd use a library like xlsx
    const headers = ['Name', 'Email', 'Enrolled Courses', 'Progress (%)', 'Last Active', 'Status']

    const rows = students.map(student => [
      student.name,
      student.email,
      student.enrolledCourses,
      student.progress,
      formatDate(student.lastActive),
      student.status
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Students exported to Excel successfully', 'success')
  } catch (error) {
    console.error('Failed to export Excel:', error)
    showToast('Failed to export Excel', 'error')
  }
}

// Enrollment Management
const enrollStudentInCourse = async () => {
  console.log('Enroll button clicked')
  console.log('Selected course ID:', selectedCourseId.value)
  console.log('Selected student:', selectedStudent.value)

  if (!selectedCourseId.value || !selectedStudent.value) {
    showToast('Please select a course', 'warning')
    return
  }

  try {
    // Convert selectedCourseId to number for comparison
    const courseId = parseInt(selectedCourseId.value)
    const course = availableCourses.value.find(c => c.id === courseId)

    console.log('Found course:', course)

    if (!course) {
      showToast('Course not found', 'error')
      return
    }

    // Initialize enrollments array if it doesn't exist
    if (!selectedStudent.value.enrollments) {
      selectedStudent.value.enrollments = []
    }

    // Check if already enrolled (compare as numbers)
    const alreadyEnrolled = selectedStudent.value.enrollments.some(
      enrollment => parseInt(enrollment.courseId) === courseId
    )

    if (alreadyEnrolled) {
      showToast('Student is already enrolled in this course', 'warning')
      return
    }

    // Add new enrollment
    const newEnrollment = {
      id: Date.now(), // Simple ID generation
      courseId: courseId,
      courseTitle: course.title,
      status: 'active',
      enrolledDate: new Date().toISOString()
    }

    console.log('Adding new enrollment:', newEnrollment)

    selectedStudent.value.enrollments.push(newEnrollment)
    selectedStudent.value.enrolledCourses = selectedStudent.value.enrollments.length

    // Update the student in the main list as well
    const studentIndex = studentStore.students.findIndex(s => s.id === selectedStudent.value.id)
    if (studentIndex !== -1) {
      studentStore.students[studentIndex].enrollments = [...selectedStudent.value.enrollments]
      studentStore.students[studentIndex].enrolledCourses = selectedStudent.value.enrollments.length
    }

    // Save to localStorage for persistence
    saveEnrollmentsToStorage()

    // Reset selection
    selectedCourseId.value = ''

    showToast(`Student enrolled in ${course.title}`, 'success')
    console.log('Enrollment successful')
  } catch (error) {
    console.error('Failed to enroll student:', error)
    showToast('Failed to enroll student', 'error')
  }
}

const unenrollStudentFromCourse = async (enrollmentId) => {
  if (!selectedStudent.value || !selectedStudent.value.enrollments) return

  try {
    const enrollment = selectedStudent.value.enrollments.find(e => e.id === enrollmentId)
    if (!enrollment) return

    // Remove enrollment
    selectedStudent.value.enrollments = selectedStudent.value.enrollments.filter(
      e => e.id !== enrollmentId
    )
    selectedStudent.value.enrolledCourses = selectedStudent.value.enrollments.length

    // Update the student in the main list as well
    const studentIndex = studentStore.students.findIndex(s => s.id === selectedStudent.value.id)
    if (studentIndex !== -1) {
      studentStore.students[studentIndex].enrollments = [...selectedStudent.value.enrollments]
      studentStore.students[studentIndex].enrolledCourses = selectedStudent.value.enrollments.length
    }

    // Save to localStorage for persistence
    saveEnrollmentsToStorage()

    showToast(`Student unenrolled from ${enrollment.courseTitle}`, 'success')
  } catch (error) {
    console.error('Failed to unenroll student:', error)
    showToast('Failed to unenroll student', 'error')
  }
}

// Bulk Operations
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedStudents.value = []
  } else {
    selectedStudents.value = filteredStudents.value.map(student => student.id)
  }
}

const toggleStudentSelection = (studentId) => {
  const index = selectedStudents.value.indexOf(studentId)
  if (index > -1) {
    selectedStudents.value.splice(index, 1)
  } else {
    selectedStudents.value.push(studentId)
  }
}

const clearSelection = () => {
  selectedStudents.value = []
}

const bulkActivateStudents = async () => {
  if (selectedStudents.value.length === 0) return

  try {
    // Update each student via the store's toggle method
    for (const studentId of selectedStudents.value) {
      const student = studentStore.students.find(s => s.id === studentId)
      if (student && student.status !== 'active') {
        await studentStore.toggleStudentStatus(studentId)
      }
    }

    showToast(`${selectedStudents.value.length} students activated`, 'success')
    clearSelection()

    // Refresh the data to ensure consistency
    await refreshStudents()
  } catch (error) {
    console.error('Failed to activate students:', error)
    showToast('Failed to activate students', 'error')
  }
}

const bulkDeactivateStudents = async () => {
  if (selectedStudents.value.length === 0) return

  try {
    // Update each student via the store's toggle method
    for (const studentId of selectedStudents.value) {
      const student = studentStore.students.find(s => s.id === studentId)
      if (student && student.status !== 'inactive') {
        await studentStore.toggleStudentStatus(studentId)
      }
    }

    showToast(`${selectedStudents.value.length} students deactivated`, 'success')
    clearSelection()

    // Refresh the data to ensure consistency
    await refreshStudents()
  } catch (error) {
    console.error('Failed to deactivate students:', error)
    showToast('Failed to deactivate students', 'error')
  }
}

const bulkDeleteStudents = async () => {
  if (selectedStudents.value.length === 0) return

  const confirmed = confirm(`Are you sure you want to delete ${selectedStudents.value.length} students? This action cannot be undone.`)
  if (!confirmed) return

  try {
    // Remove students from the store
    studentStore.students = studentStore.students.filter(
      student => !selectedStudents.value.includes(student.id)
    )

    showToast(`${selectedStudents.value.length} students deleted`, 'success')
    clearSelection()
  } catch (error) {
    console.error('Failed to delete students:', error)
    showToast('Failed to delete students', 'error')
  }
}

// Avatar helper functions
const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getDefaultAvatar = (name) => {
  // Generate a simple colored background based on name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  const index = name ? name.charCodeAt(0) % colors.length : 0
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${colors[index]}"/>
    </svg>
  `)}`
}

// LocalStorage helpers for enrollment persistence
const saveEnrollmentsToStorage = () => {
  try {
    const enrollmentData = {}
    studentStore.students.forEach(student => {
      if (student.enrollments && student.enrollments.length > 0) {
        enrollmentData[student.id] = student.enrollments
      }
    })
    localStorage.setItem('studentEnrollments', JSON.stringify(enrollmentData))
  } catch (error) {
    console.error('Failed to save enrollments to localStorage:', error)
  }
}

const loadSavedEnrollments = () => {
  try {
    const saved = localStorage.getItem('studentEnrollments')
    if (saved) {
      const enrollmentData = JSON.parse(saved)
      studentStore.students.forEach(student => {
        if (enrollmentData[student.id]) {
          student.enrollments = enrollmentData[student.id]
          student.enrolledCourses = enrollmentData[student.id].length
        }
      })
    }
  } catch (error) {
    console.error('Failed to load enrollments from localStorage:', error)
  }
}
</script>

<style scoped>
.admin-students {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px; /* Exact height of admin header */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

.admin-students .header {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
}

.student-page-header {
  width: 100% !important;
  max-width: none !important;
}

.student-page-header .page-title {
  margin: 0 !important;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative;
  z-index: 3;
  line-height: 1.2 !important;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  background: var(--accent-color);
  color: white;
  border: 2px solid var(--accent-color);
  border-radius: 6px;
  padding: 0.625rem 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(5, 184, 58, 0.2);
}

.export-btn:hover {
  background: #048a32;
  border-color: #048a32;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(5, 184, 58, 0.3);
}

.export-btn i {
  font-size: 0.85rem;
}

.filter-select,
.search-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--secondary-black);
  color: var(--text-primary);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--secondary-black);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-top: 0.5rem;
}

.students-table {
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  position: relative;
  min-width: 600px; /* Ensure minimum width for proper layout */
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

th {
  background: var(--secondary-bg);
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  position: relative;
}

th.sortable:hover {
  background: var(--border-color);
}

th.sortable i {
  margin-left: 0.5rem;
  opacity: 0.6;
  font-size: 0.8rem;
}

th.sortable.sorted i {
  opacity: 1;
  color: var(--primary-color);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  position: relative;
}

.avatar-initials {
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.avatar-initials.large {
  font-size: 32px;
}

.student-name {
  font-weight: 500;
}

.student-email {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-bar {
  height: 8px;
  background: var(--tertiary-black);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.status-badge.active {
  background: rgba(0, 255, 148, 0.1);
  color: #00FF94;
}

.status-badge.inactive {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-btn,
.status-btn {
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.view-btn {
  background: var(--tertiary-black);
  color: var(--text-primary);
}

.status-btn.active {
  background: #28a745;
  color: white;
  border: 1px solid #28a745;
}

.status-btn.inactive {
  background: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.view-btn:hover {
  background: var(--border-color);
}

.status-btn.active:hover {
  background: #218838;
  border-color: #218838;
}

.status-btn.inactive:hover {
  background: #c82333;
  border-color: #c82333;
}

/* Desktop specific styles */
@media (min-width: 769px) {
  .admin-students {
    margin-top: 72px; /* Exact admin header height */
    padding-top: 0.5rem; /* Reduced by half */
  }

  .admin-students .header {
    margin-top: 0;
  }

  .student-page-header {
    position: static !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    transform: none !important;
  }

  .student-page-header .page-title {
    font-size: 2rem !important;
  }

  /* Desktop table optimizations */
  .students-table {
    box-shadow: 0 2px 8px var(--shadow);
  }

  table {
    min-width: 800px; /* Ensure proper spacing on desktop */
  }

  th, td {
    padding: 1.25rem 1rem; /* Slightly more padding on desktop */
  }
}

/* Phase 2: Medium Mobile/Tablet (481px - 768px) */
@media (max-width: 768px) and (min-width: 481px) {
  .admin-students {
    padding: 0.75rem;
    margin-top: 0; /* Admin header is relative on mobile */
    padding-top: 0.75rem;
  }

  .admin-students .header {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .student-page-header .page-title {
    font-size: 1.75rem !important;
  }

  /* Medium mobile table */
  .students-table {
    font-size: 0.9rem;
    margin: 0 -0.75rem;
  }

  .students-table th,
  .students-table td {
    padding: 0.875rem 0.75rem;
  }

  /* Hide some columns but keep more than Phase 3 */
  .students-table th:nth-child(3),
  .students-table td:nth-child(3) {
    display: none; /* Hide email column */
  }

  .students-table th:nth-child(4),
  .students-table td:nth-child(4) {
    display: none; /* Hide enrolled courses column */
  }

  /* Medium mobile action buttons */
  .view-btn,
  .status-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}

/* Phase 2 Fallback: All Mobile (768px and below) */
@media (max-width: 768px) {
  .admin-students {
    padding: 0.5rem;
    margin-top: 0; /* Admin header is relative on mobile */
    padding-top: 0.5rem;
  }

  .admin-students .header {
    padding: 1rem;
    margin-bottom: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .student-page-header .page-title {
    font-size: 1.5rem !important;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Hide export buttons on mobile - they don't work well */
  .export-btn {
    display: none;
  }

  /* Optimize header actions for mobile */
  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Optimize form inputs for mobile */
  .filter-select,
  .search-input {
    width: 100%;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.75rem;
  }

  /* Mobile table optimization */
  .students-table {
    font-size: 0.875rem;
    margin: 0 -0.5rem; /* Extend to edges on mobile */
    border-radius: 0;
  }

  table {
    min-width: 100%; /* Remove minimum width on mobile */
  }

  .students-table th,
  .students-table td {
    padding: 0.75rem 0.5rem;
    white-space: normal; /* Allow text wrapping on mobile */
  }

  /* Hide some table columns on mobile */
  .students-table th:nth-child(3),
  .students-table td:nth-child(3) {
    display: none; /* Hide email column */
  }

  .students-table th:nth-child(4),
  .students-table td:nth-child(4) {
    display: none; /* Hide enrolled courses column */
  }

  /* Make remaining columns responsive */
  .students-table th:nth-child(1),
  .students-table td:nth-child(1) {
    width: 5%; /* Checkbox column */
  }

  .students-table th:nth-child(2),
  .students-table td:nth-child(2) {
    width: 50%; /* Student name column */
  }

  .students-table th:nth-child(5),
  .students-table td:nth-child(5) {
    width: 25%; /* Last active column */
  }

  .students-table th:nth-child(6),
  .students-table td:nth-child(6) {
    width: 20%; /* Actions column */
  }

  /* Optimize action buttons for mobile */
  .view-btn,
  .status-btn {
    padding: 0.375rem;
    font-size: 0.75rem;
  }
}

/* Phase 3: Very Small Mobile (Phone) - 480px and below */
@media (max-width: 480px) {
  .admin-students {
    padding: 0.25rem;
    padding-top: 0.25rem;
  }

  .admin-students .header {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    border-radius: 6px;
  }

  .student-page-header .page-title {
    font-size: 1.25rem !important;
    line-height: 1.1 !important;
  }

  /* Hide export buttons completely */
  .export-btn {
    display: none !important;
  }

  /* Ultra compact filters */
  .filters {
    gap: 0.25rem;
  }

  .filter-select,
  .search-input {
    padding: 0.5rem;
    font-size: 14px;
    border-radius: 4px;
  }

  /* Ultra compact table */
  .students-table {
    margin: 0 -0.25rem;
    font-size: 0.75rem;
    border-radius: 4px;
  }

  .students-table th,
  .students-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }

  /* Hide even more columns on very small screens */
  .students-table th:nth-child(5),
  .students-table td:nth-child(5) {
    display: none; /* Hide last active column */
  }

  /* Adjust remaining column widths for phone */
  .students-table th:nth-child(1),
  .students-table td:nth-child(1) {
    width: 8%; /* Checkbox */
  }

  .students-table th:nth-child(2),
  .students-table td:nth-child(2) {
    width: 60%; /* Student name - more space */
  }

  .students-table th:nth-child(6),
  .students-table td:nth-child(6) {
    width: 32%; /* Actions - more space */
  }

  /* Ultra compact action buttons */
  .view-btn,
  .status-btn {
    padding: 0.25rem;
    font-size: 0.625rem;
    min-width: 28px;
    height: 28px;
  }

  .view-btn i,
  .status-btn i {
    font-size: 0.625rem;
  }

  /* Compact student info */
  .student-info {
    gap: 0.5rem;
  }

  .student-avatar {
    width: 28px;
    height: 28px;
  }

  .avatar-initials {
    width: 28px;
    height: 28px;
    font-size: 0.625rem;
  }

  .student-name {
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .student-email {
    font-size: 0.625rem;
    line-height: 1.1;
  }

  /* Compact status badges */
  .status-badge {
    padding: 0.125rem 0.25rem;
    font-size: 0.625rem;
    border-radius: 3px;
  }

  /* Hide pagination text, show only buttons */
  .pagination {
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .pagination-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }

  /* Phase 3 Modal Optimizations */
  .modal-overlay {
    padding-top: 2vh;
  }

  .modal-content {
    width: 98%;
    max-width: none;
    margin: 0 1%;
    margin-bottom: 2vh;
    border-radius: 8px;
  }

  .modal-header {
    padding: 1rem;
    border-radius: 8px 8px 0 0;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  /* Compact profile stats */
  .profile-stats {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }

  .stat-item h4 {
    font-size: 0.75rem;
  }

  .stat-item .stat-value {
    font-size: 1.25rem;
  }

  /* Compact enrollment section */
  .enrollment-section {
    padding: 1rem;
    margin: 1rem 0;
  }

  .enrollment-section h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .course-select {
    padding: 0.5rem;
    font-size: 14px;
  }

  .enroll-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  /* Compact enrollment list */
  .enrollment-item {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .enrollment-item h4 {
    font-size: 0.875rem;
  }

  .enrollment-item p {
    font-size: 0.75rem;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
}

.pagination-btn {
  background: var(--secondary-black);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--tertiary-black);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 1rem;
  color: var(--text-secondary);
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  background: var(--secondary-black);
  border-radius: 8px;
  margin-top: 1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Transition styles */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly */
.fade-leave-active {
  position: absolute;
}

/* Improve table layout for transitions */
tbody tr {
  transition: background-color 0.3s ease;
  background: var(--card-bg);
}

tbody tr:nth-child(even) {
  background: var(--secondary-bg);
}

tbody tr:hover {
  background: var(--hover-bg) !important;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding-top: 5vh;
  overflow-y: auto;
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: 12px;
  width: 95%;
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease-out;
  border: 1px solid var(--border-color);
  margin-bottom: 5vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  border-bottom: 2px solid var(--accent-color);
  background: var(--card-bg);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
}

.close-btn {
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
  transform: scale(1.1);
}

.modal-body {
  padding: 2.5rem;
  background: var(--card-bg);
  border-radius: 0 0 12px 12px;
}

/* Student profile styles */
.student-profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  gap: 1.5rem;
}

.student-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--accent-color);
  position: relative;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-input {
  background-color: var(--tertiary-black);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.2s;
}

.edit-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.name-input {
  font-size: 1.25rem;
  font-weight: 600;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--primary-color);
}

.toggle-switch input:checked + label:before {
  transform: translateX(26px);
}

.status-text {
  font-weight: 500;
}

.status-text.active {
  color: var(--success-color);
}

.status-text.inactive {
  color: var(--danger-color);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  background-color: var(--secondary-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.save-btn, .delete-btn {
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  min-width: 140px;
  justify-content: center;
}

.save-btn {
  background: #007bff;
  color: white;
  border: 2px solid #007bff;
  box-shadow: 0 3px 6px rgba(0, 123, 255, 0.3);
}

.save-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 123, 255, 0.4);
}

.delete-btn {
  background: transparent;
  color: #dc3545;
  border: 2px solid #dc3545;
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border-color: #dc3545;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(220, 53, 69, 0.4);
}

/* Delete confirmation modal */
.delete-modal {
  max-width: 400px;
}

.confirm-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn, .confirm-delete-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background-color: var(--tertiary-black);
}

.confirm-delete-btn {
  background-color: var(--danger-color);
  color: white;
  border: none;
}

.confirm-delete-btn:hover {
  background-color: var(--danger-color-dark);
}

/* Enrollment Management Styles */
.enrollment-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--secondary-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.enrollment-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.enrollment-section h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.enrollment-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.course-select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.enroll-btn {
  background: #28a745;
  color: white;
  border: 2px solid #28a745;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
}

.enroll-btn:hover:not(:disabled) {
  background: #218838;
  border-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.enroll-btn:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.enrollment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--secondary-black);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.enrollment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.course-title {
  font-weight: 500;
  color: var(--text-primary);
}

.enrollment-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  text-transform: capitalize;
}

.enrollment-status.active {
  background: var(--success-color);
  color: white;
}

.enrollment-status.completed {
  background: var(--primary-color);
  color: white;
}

.enrollment-status.inactive {
  background: var(--border-color);
  color: var(--text-secondary);
}

.unenroll-btn {
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.unenroll-btn:hover {
  background: var(--danger-color-dark);
}

/* Bulk Operations Styles */
.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--primary-color);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-info {
  font-weight: 500;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  padding: 0.625rem 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.bulk-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.bulk-btn.delete:hover {
  background: var(--danger-color);
  border-color: var(--danger-color);
}

.bulk-btn.activate:hover {
  background: var(--success-color);
  border-color: var(--success-color);
}

.bulk-btn.deactivate:hover {
  background: var(--warning-color);
  border-color: var(--warning-color);
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.bulk-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>








