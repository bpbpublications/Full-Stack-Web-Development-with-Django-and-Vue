<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Welcome Back</h1>
      <p class="auth-subtitle">Sign in to continue learning</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="formData.password"
              required
              placeholder="Enter your password"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="formData.rememberMe">
            <span>Remember me</span>
          </label>
          <router-link to="/forgot-password" class="forgot-password">
            Forgot Password?
          </router-link>
        </div>

        <div v-if="errorMessage" class="error-toast">
          {{ errorMessage }}
          <button class="close-toast" @click="errorMessage = ''">×</button>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account? 
        <router-link to="/register">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { authService } from '../services/authService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true
    
    const response = await authService.login(formData.value)
    
    // Debug log
    console.log('Login response:', response)
    console.log('User role before setting:', response.user.role)
    
    // Set user data with authentication flag
    userStore.setUser({
      ...response.user,
      isAuthenticated: true
    })

    // Debug log after setting user
    console.log('User store state after login:', userStore.$state)
    console.log('Is admin?', userStore.isAdmin)
    console.log('Current role:', userStore.getUserProfile.role)

    // Store tokens
    if (response.access) {
      localStorage.setItem('access_token', response.access)
    }
    if (response.refresh) {
      localStorage.setItem('refresh_token', response.refresh)
    }

    // Handle redirect
    const redirectPath = route.query.redirect || userStore.defaultRedirectPath
    console.log('Redirecting to:', redirectPath)
    await router.replace(redirectPath)    
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.response?.data?.error || 'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 72px); /* Adjust based on your header height */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  background: var(--secondary-black);
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid var(--tertiary-black);
  width: 100%;
  max-width: 420px;
}

.auth-container h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.auth-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--tertiary-black);
  border-radius: 8px;
  background: var(--tertiary-black);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.forgot-password {
  color: var(--accent-color);
  text-decoration: none;
}

.forgot-password:hover {
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
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--accent-color);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.error-toast {
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

.close-toast {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
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
</style>









