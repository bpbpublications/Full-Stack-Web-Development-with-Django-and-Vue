import axios from 'axios'

// API configuration
const API_BASE_URL = 'http://127.0.0.1:8080'

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
})

// Add request interceptor to include authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login'
          return Promise.reject(error)
        }
        
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access_token', access)
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return axios(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Token refresh failed:', refreshError)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
