<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Create Account</h1>
        <p class="auth-subtitle">Join our learning community</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <div v-if="errorMessage" class="general-error">
          {{ errorMessage }}
          <button class="close-toast" @click="errorMessage = ''">×</button>
        </div>
        <div class="form-group" :class="{ 'error': v$.formData.name.$error }">
          <label for="name">Full Name</label>
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name"
              @blur="v$.formData.name.$touch()"
              placeholder="Enter your full name"
            >
          </div>
          <span class="error-message" v-if="v$.formData.name.$error">
            {{ v$.formData.name.$errors[0].$message }}
          </span>
        </div>

        <div class="form-group" :class="{ 'error': v$.formData.email.$error }">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email"
              @blur="v$.formData.email.$touch()"
              placeholder="Enter your email"
            >
          </div>
          <span class="error-message" v-if="v$.formData.email.$error">
            {{ v$.formData.email.$errors[0].$message }}
          </span>
        </div>

        <div class="form-group" :class="{ 'error': v$.formData.password.$error }">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="formData.password"
              @blur="v$.formData.password.$touch()"
              placeholder="Create a password"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <span class="error-message" v-if="v$.formData.password.$error">
            {{ v$.formData.password.$errors[0].$message }}
          </span>
          <div class="password-strength" v-if="formData.password">
            <div class="strength-bar">
              <div 
                class="strength-indicator"
                :style="{ width: `${passwordStrength.score * 25}%` }"
                :class="passwordStrength.class"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">
              {{ passwordStrength.text }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="role">I want to</label>
          <div class="role-options">
            <label class="role-option" :class="{ 'selected': formData.role === 'student' }">
              <input 
                type="radio" 
                name="role"
                value="student"
                v-model="formData.role"
              >
              <i class="fas fa-user-graduate"></i>
              <span>Learn as a Student</span>
            </label>
            <label class="role-option" :class="{ 'selected': formData.role === 'instructor' }">
              <input 
                type="radio"
                name="role"
                value="instructor"
                v-model="formData.role"
              >
              <i class="fas fa-chalkboard-teacher"></i>
              <span>Teach as an Instructor</span>
            </label>
          </div>
        </div>

        <div class="terms-checkbox" :class="{ 'error': v$.formData.acceptTerms.$error }">
          <label>
            <input 
              type="checkbox" 
              v-model="formData.acceptTerms"
              @blur="v$.formData.acceptTerms.$touch()"
            >
            <span>
              I agree to the 
              <router-link to="/terms">Terms of Service</router-link> 
              and 
              <router-link to="/privacy">Privacy Policy</router-link>
            </span>
          </label>
          <span class="error-message" v-if="v$.formData.acceptTerms.$error">
            {{ v$.formData.acceptTerms.$errors[0].$message }}
          </span>
        </div>

        <button 
          type="submit" 
          class="submit-btn" 
          :disabled="isLoading || v$.$invalid"
        >
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            Creating account...
          </span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <p class="auth-footer">
        Already have an account? 
        <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import { authService } from '../services/authService'

const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'student',
  acceptTerms: false
})

const rules = {
  formData: {
    name: { 
      required: helpers.withMessage('Name is required', required),
      minLength: helpers.withMessage('Name must be at least 2 characters', minLength(2))
    },
    email: { 
      required: helpers.withMessage('Email is required', required),
      email: helpers.withMessage('Please enter a valid email address', email)
    },
    password: { 
      required: helpers.withMessage('Password is required', required),
      minLength: helpers.withMessage('Password must be at least 8 characters', minLength(8))
    },
    acceptTerms: { 
      required: helpers.withMessage('You must accept the terms and conditions', required)
    }
  }
}

const v$ = useVuelidate(rules, { formData })

const passwordStrength = computed(() => {
  const password = formData.value.password
  if (!password) return { score: 0, text: '', class: '' }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const strengthMap = {
    0: { text: 'Weak', class: 'weak' },
    1: { text: 'Fair', class: 'fair' },
    2: { text: 'Good', class: 'good' },
    3: { text: 'Strong', class: 'strong' },
    4: { text: 'Very Strong', class: 'very-strong' }
  }

  return { score, ...strengthMap[score] }
})

const handleRegister = async () => {
  const isFormValid = await v$.value.$validate()
  if (!isFormValid) return

  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Correct way to call the register method on the authService object
    const response = await authService.register(formData.value)
    userStore.setUser(response.user)
    
    // Store tokens if they exist in the response
    if (response.access) {
      localStorage.setItem('access_token', response.access)
    }
    if (response.refresh) {
      localStorage.setItem('refresh_token', response.refresh)
    }
    
    // Redirect to appropriate dashboard based on role
    if (userStore.isInstructor) {
      await router.push('/instructor/overview')
    } else {
      await router.push('/dashboard/my-courses')
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle field-specific validation errors
    if (error.response && error.response.data && error.response.data.fields) {
      Object.entries(error.response.data.fields).forEach(([field, messages]) => {
        if (v$.value.formData[field]) {
          v$.value.formData[field].$errors = messages.map(msg => ({
            $message: msg
          }))
        }
      })
    } else {
      // Show general error message
      errorMessage.value = error.response?.data?.error || error.message || 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--primary-black);
}

.auth-container {
  background: var(--secondary-black);
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  background: var(--tertiary-black);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  z-index: 2;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: var(--tertiary-black);
  border-radius: 2px;
  overflow: hidden;
}

.strength-indicator {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-text {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.weak { background-color: #ff4444; color: #ff4444; }
.fair { background-color: #ffbb33; color: #ffbb33; }
.good { background-color: #00C851; color: #00C851; }
.strong { background-color: #33b5e5; color: #33b5e5; }
.very-strong { background-color: #2BBBAD; color: #2BBBAD; }

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-option input {
  position: absolute;
  opacity: 0;
}

.role-option i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.role-option span {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.role-option.selected {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.1);
}

.role-option.selected i,
.role-option.selected span {
  color: var(--accent-color);
}

.terms-checkbox {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.terms-checkbox label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.terms-checkbox input {
  margin-top: 0.25rem;
}

.terms-checkbox a {
  color: var(--accent-color);
  text-decoration: none;
}

.terms-checkbox a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: var(--accent-color);
  color: var(--primary-black);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message::before {
  content: '⚠';
  font-size: 1rem;
}

.form-group.error input {
  border-color: #ff4444;
  background-color: rgba(255, 68, 68, 0.05);
}

.form-group.error label {
  color: #ff4444;
}

.general-error {
  background-color: #ff4444;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1.5rem;
  }

  .role-options {
    grid-template-columns: 1fr;
  }
}
</style>











