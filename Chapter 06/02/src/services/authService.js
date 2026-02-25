import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true 
})


api.interceptors.request.use(
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


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_URL}api/auth/refresh/`, {
          refresh: refreshToken
        })
        
        const { access } = response.data
        localStorage.setItem('access_token', access)
        
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('api/auth/login/', credentials)
      const userData = response.data.user

      if (!userData || !userData.id || !userData.email) {
        throw new Error('Invalid response: missing required user data')
      }

      const transformedUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar || null,
        bio: userData.bio || '',
        joinedDate: userData.date_joined || new Date().toISOString(),
        isAuthenticated: true
      }

      return {
        user: transformedUser,
        access: response.data.access,
        refresh: response.data.refresh
      }
    } catch (error) {
      throw error
    }
  },

  async register(userData) {
    try {
      const response = await api.post('api/auth/register/', userData)
      const userDataFromResponse = response.data.user

      if (!userDataFromResponse || !userDataFromResponse.id || !userDataFromResponse.email) {
        throw new Error('Invalid response: missing required user data')
      }

      const transformedUser = {
        id: userDataFromResponse.id,
        email: userDataFromResponse.email,
        name: userDataFromResponse.name,
        role: userDataFromResponse.role,
        avatar: userDataFromResponse.avatar || null,
        bio: userDataFromResponse.bio || '',
        joinedDate: userDataFromResponse.date_joined || new Date().toISOString(),
        isAuthenticated: true
      }

      return {
        user: transformedUser,
        access: response.data.access,
        refresh: response.data.refresh
      }
    } catch (error) {
      throw error
    }
  },

  async logout() {
    try {
      await api.post('api/auth/logout/')
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  getToken() {
    return localStorage.getItem('access_token')
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}









