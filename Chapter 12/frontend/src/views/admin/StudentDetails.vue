<template>
  <div class="student-details">
    <div class="header">
      <h1>Student Details</h1>
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back to Students
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading student details...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">Return to Students</button>
    </div>

    <div v-else-if="student" class="student-content">
      <div class="profile-card">
        <div class="profile-header">
          <img 
            :src="student.avatar || '/default-avatar.png'" 
            :alt="student.name" 
            class="student-avatar-large"
          >
          <div class="profile-info">
            <h2>{{ student.name }}</h2>
            <p class="email">{{ student.email }}</p>
            <span :class="['status-badge', student.status]">
              {{ student.status }}
            </span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ student.enrolledCourses }}</span>
            <span class="stat-label">Enrolled Courses</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ student.progress }}%</span>
            <span class="stat-label">Average Progress</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ formatDate(student.lastActive) }}</span>
            <span class="stat-label">Last Active</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="edit-btn" @click="editStudent">
            <i class="fas fa-edit"></i> Edit Student
          </button>
          <button class="delete-btn" @click="confirmDeleteStudent">
            <i class="fas fa-trash"></i> Delete Student
          </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '../../stores/studentStore'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()

const studentId = route.params.id
const student = ref(null)
const loading = ref(true)
const error = ref(null)
const showDeleteModal = ref(false)

onMounted(async () => {
  await fetchStudentDetails()
})

const fetchStudentDetails = async () => {
  loading.value = true
  error.value = null
  
  try {
    // First check if the student is already in the store
    if (studentStore.students.length > 0) {
      student.value = studentStore.students.find(s => s.id == studentId)
    }
    
    // If not found in store, fetch it
    if (!student.value) {
      await studentStore.fetchStudentById(studentId)
      student.value = studentStore.selectedStudent
    }
  } catch (err) {
    console.error('Failed to fetch student details:', err)
    error.value = 'Failed to load student details. Please try again.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/admin/students')
}

const editStudent = () => {
  // Navigate to edit page or show edit modal
  router.push(`/admin/students/edit/${studentId}`)
}

const confirmDeleteStudent = () => {
  showDeleteModal.value = true
}

const deleteStudent = async () => {
  try {
    await studentStore.deleteStudent(studentId)
    showDeleteModal.value = false
    router.push('/admin/students')
    alert('Student deleted successfully')
  } catch (error) {
    console.error('Failed to delete student:', error)
    alert('Failed to delete student')
  }
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.student-details {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--tertiary-black);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: var(--secondary-black);
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--secondary-black);
  border-radius: 8px;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  color: var(--danger-color);
  margin-bottom: 1rem;
}

.profile-card {
  background-color: var(--secondary-black);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.student-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-color);
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.email {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(46, 213, 115, 0.15);
  color: var(--success-color);
}

.status-badge.inactive {
  background-color: rgba(246, 71, 71, 0.15);
  color: var(--danger-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--tertiary-black);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.edit-btn, .delete-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.edit-btn:hover {
  background-color: var(--primary-color-dark);
}

.delete-btn {
  background-color: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.delete-btn:hover {
  background-color: var(--danger-color);
  color: white;
}

/* Modal styles (same as in Students.vue) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--secondary-black);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

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