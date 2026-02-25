import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: localStorage.getItem('theme') || 'dark',
    themes: {
      dark: {
        name: 'dark',
        displayName: 'Dark Theme',
        variables: {
          '--primary-bg': '#121212',
          '--secondary-bg': '#1E1E1E',
          '--tertiary-bg': '#2D2D2D',
          '--accent-color': '#05b83a',
          '--text-primary': '#FFFFFF',
          '--text-secondary': '#B3B3B3',
          '--text-muted': '#808080',
          '--border-color': '#2D2D2D',
          '--border-light': '#404040',
          '--hover-bg': '#333333',
          '--card-bg': '#1E1E1E',
          '--input-bg': '#2D2D2D',
          '--input-border': '#404040',
          '--shadow': 'rgba(0, 0, 0, 0.3)',
          '--shadow-light': 'rgba(0, 0, 0, 0.1)',
          '--success': '#4caf50',
          '--error': '#f44336',
          '--warning': '#ff9800',
          '--info': '#2196f3'
        }
      },
      light: {
        name: 'light',
        displayName: 'Light Theme',
        variables: {
          '--primary-bg': '#FFFFFF',
          '--secondary-bg': '#F8F9FA',
          '--tertiary-bg': '#E9ECEF',
          '--accent-color': '#05b83a',
          '--text-primary': '#212529',
          '--text-secondary': '#6C757D',
          '--text-muted': '#ADB5BD',
          '--border-color': '#DEE2E6',
          '--border-light': '#E9ECEF',
          '--hover-bg': '#F8F9FA',
          '--card-bg': '#FFFFFF',
          '--input-bg': '#FFFFFF',
          '--input-border': '#CED4DA',
          '--shadow': 'rgba(0, 0, 0, 0.1)',
          '--shadow-light': 'rgba(0, 0, 0, 0.05)',
          '--success': '#198754',
          '--error': '#dc3545',
          '--warning': '#fd7e14',
          '--info': '#0dcaf0'
        }
      }
    }
  }),

  getters: {
    isDark: (state) => state.currentTheme === 'dark',
    isLight: (state) => state.currentTheme === 'light',
    theme: (state) => state.themes[state.currentTheme],
    themeVariables: (state) => state.themes[state.currentTheme].variables,
    availableThemes: (state) => Object.values(state.themes)
  },

  actions: {
    initializeTheme() {
      // Get theme from localStorage or default to dark
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme && this.themes[savedTheme]) {
        this.currentTheme = savedTheme
      } else {
        this.currentTheme = 'dark'
      }
      
      this.applyTheme()
    },

    setTheme(themeName) {
      if (!this.themes[themeName]) {
        console.warn(`Theme "${themeName}" not found`)
        return
      }

      this.currentTheme = themeName
      localStorage.setItem('theme', themeName)
      this.applyTheme()
    },

    toggleTheme() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
      this.setTheme(newTheme)
    },

    applyTheme() {
      const root = document.documentElement
      const themeVariables = this.themeVariables

      // Apply all theme variables to CSS custom properties
      Object.entries(themeVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })

      // Add theme class to body for additional styling if needed
      document.body.className = document.body.className.replace(/theme-\w+/g, '')
      document.body.classList.add(`theme-${this.currentTheme}`)

      // Dispatch custom event for components that need to react to theme changes
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: {
          theme: this.currentTheme,
          variables: themeVariables
        }
      }))
    },

    getThemeVariable(variableName) {
      return this.themeVariables[variableName] || null
    }
  }
})
