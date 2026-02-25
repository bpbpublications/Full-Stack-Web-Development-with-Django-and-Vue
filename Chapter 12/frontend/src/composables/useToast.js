import { ref, readonly } from 'vue'

// Create a reactive state for toasts
const toasts = ref([])
let toastId = 0

export function useToast() {
  // Function to show a toast
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++
    
    // Add toast to the array
    toasts.value.push({
      id,
      message,
      type,
      show: true
    })
    
    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }
  
  // Function to manually remove a toast
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      // First set show to false for animation
      toasts.value[index].show = false
      
      // Then remove after animation completes
      setTimeout(() => {
        toasts.value = toasts.value.filter(toast => toast.id !== id)
      }, 300)
    }
  }
  
  return {
    toasts: readonly(toasts),
    showToast,
    removeToast
  }
}
