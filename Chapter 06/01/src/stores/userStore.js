import { defineStore } from 'pinia'
import { authService } from '../services/authService'

export const useUserStore = defineStore('user', {
  state: () => {
    try {
      const user = localStorage.getItem('user')
      return {
        user: user ? JSON.parse(user) : {
          id: null,
          name: null,
          email: null,
          role: null,
          avatar: null,
          bio: '',
          joinedDate: null,
          isAuthenticated: false
        },
        isLoading: false
      }
    } catch {
      return {
        user: {
          id: null,
          name: null,
          email: null,
          role: null,
          avatar: null,
          bio: '',
          joinedDate: null,
          isAuthenticated: false
        },
        isLoading: false
      }
    }
  },

  getters: {
    getUserProfile: (state) => state.user,
    isAuthenticated: (state) => Boolean(state.user.isAuthenticated),
    isAdmin: (state) => {
      return state.user.role?.toLowerCase() === 'administrator' || 
             state.user.role?.toLowerCase() === 'admin'
    },
    isInstructor: (state) => state.user.role?.toLowerCase() === 'instructor',
    isStudent: (state) => state.user.role?.toLowerCase() === 'student',
    defaultRedirectPath: (state) => {
      const role = state.user.role?.toLowerCase()
      if (role === 'administrator') return '/admin/dashboard'
      if (role === 'instructor') return '/instructor/overview'
      return '/dashboard'
    }
  },

  actions: {
    async initializeAuth() {
      const token = authService.getToken()
      if (!token) {
        this.logout()
        return
      }

      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        if (userData && userData.id) {
          this.setUser(userData)
        } else {
          this.logout()
        }
      } catch {
        this.logout()
      }
    },

    setUser(userData) {
      if (!userData || !userData.id || !userData.email) {
        this.logout()
        return
      }

      this.user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        bio: userData.bio || '',
        joinedDate: userData.joinedDate,
        isAuthenticated: true
      }
      
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    updateProfile(profileData) {
      this.user = {
        ...this.user,
        ...profileData
      }
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    logout() {
      this.user = {
        id: null,
        name: null,
        email: null,
        role: null,
        avatar: null,
        bio: '',
        joinedDate: null,
        isAuthenticated: false
      }
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }
})









