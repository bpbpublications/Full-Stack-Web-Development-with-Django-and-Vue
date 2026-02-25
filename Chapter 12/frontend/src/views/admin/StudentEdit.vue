<template>
  <div class="student-edit">
    <div class="header">
      <h1>Edit Student</h1>
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> Back
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading student data...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">Return to Students</button>
    </div>

    <div v-else class="edit-form-container">
      <form @submit.prevent="saveStudent" class="edit-form">
        <div class="form-header">
          <div class="avatar-section">
            <img 
              :src="studentForm.avatar || '/default-avatar.png'" 
              :alt="studentForm.name" 
              class="student-avatar-large"
            >
            <div class="avatar-upload">
              <label for="avatar-upload" class="upload-btn">
                <i class="fas fa-camera"></i> Change Photo
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                @change="handleAvatarUpload" 
                class="file-input"
              >
            </div>
          </div>
          
          <div class="form-group-header">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                v-model="studentForm.name" 
                required 
                class="form-input"
                placeholder="Enter student's full name"
              >
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                v-model="studentForm.email" 
                required 
                class="form-input"
                placeholder="Enter student's email address"
              >
            </div>
            
            <div class="form-group">
              <label>Status</label>
              <div class="status-toggle">
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="statusToggle" 
                    :checked="studentForm.status === 'active'"
                    @change="studentForm.status = $event.target.checked ? 'active' : 'inactive'"
                  >
                  <label for="statusToggle"></label>
                </div>
                <span :class="['status-text', studentForm.status]">
                  {{ studentForm.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Additional Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="studentForm.phone" 
                class="form-input"
                placeholder="Enter phone number (optional)"
              >
            </div>
            
            <div class="form-group">
              <label for="location">Location</label>
              <input 
                type="text" 
                id="location" 
                v-model="studentForm.location" 
                class="form-input"
                placeholder="City, Country (optional)"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea 
              id="bio" 
              v-model="studentForm.bio" 
              class="form-textarea"
              placeholder="Enter student bio or notes (optional)"
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="goBack">Cancel</button>
          <button type="submit" class="save-btn" :disabled="saving">
            <i class="fas fa-save"></i> {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '../../stores/studentStore'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const { showToast } = useToast()

const studentId = route.params.id
const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const studentForm = ref({
  id: null,
  name: '',
  email: '',
  status: 'active',
  avatar: '',
  phone: '',
  location: '',
  bio: ''
})

onMounted(async () => {
  await fetchStudentData()
})

const fetchStudentData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // First check if the student is already in the store
    let student = null
    if (studentStore.students.length > 0) {
      student = studentStore.students.find(s => s.id == studentId)
    }
    
    // If not found in store, fetch it
    if (!student) {
      await studentStore.fetchStudentById(studentId)
      student = studentStore.selectedStudent
    }
    
    if (student) {
      studentForm.value = {
        id: student.id,
        name: student.name || '',
        email: student.email || '',
        status: student.status || 'active',
        avatar: student.avatar || '',
        phone: student.phone || '',
        location: student.location || '',
        bio: student.bio || ''
      }
    } else {
      error.value = 'Student not found'
    }
  } catch (err) {
    console.error('Failed to fetch student data:', err)
    error.value = 'Failed to load student data. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Check file type
  if (!file.type.match('image.*')) {
    alert('Please select an image file')
    return
  }
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size should be less than 2MB')
    return
  }
  
  // Create a preview URL
  studentForm.value.avatarFile = file
  studentForm.value.avatar = URL.createObjectURL(file)
}

const saveStudent = async () => {
  saving.value = true
  
  try {
    const formData = new FormData()
    
    // Add basic info
    formData.append('name', studentForm.value.name)
    formData.append('email', studentForm.value.email)
    formData.append('is_active', studentForm.value.status === 'active')
    
    // Add additional info if available
    if (studentForm.value.phone) formData.append('phone', studentForm.value.phone)
    if (studentForm.value.location) formData.append('location', studentForm.value.location)
    if (studentForm.value.bio) formData.append('bio', studentForm.value.bio)
    
    // Add avatar if a new one was uploaded
    if (studentForm.value.avatarFile) {
      formData.append('avatar', studentForm.value.avatarFile)
    }
    
    // Update the student
    const updatedStudent = await studentStore.updateStudentWithFormData(studentId, formData)
    
    // Show success toast notification with student name
    showToast(`${updatedStudent.name}'s record has been updated successfully`, 'success')
    
    // Navigate back to student details
    router.push(`/admin/students/${studentId}`)
  } catch (error) {
    console.error('Failed to update student:', error)
    
    // Show error toast
    showToast('Failed to update student record', 'error')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push(`/admin/students/${studentId}`)
}
</script>

<style scoped>
.student-edit {
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

.edit-form-container {
  background-color: var(--secondary-black);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-header {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.student-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-color);
}

.avatar-upload {
  width: 100%;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--tertiary-black);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.upload-btn:hover {
  background-color: var(--primary-color);
  color: white;
}

.file-input {
  display: none;
}

.form-group-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-input, .form-textarea {
  background-color: var(--tertiary-black);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background-color: var(--tertiary-black);
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: var(--primary-color-dark);
}

.save-btn:disabled {
  background-color: var(--tertiary-black);
  color: var(--text-secondary);
  cursor: not-allowed;
}
</style>

