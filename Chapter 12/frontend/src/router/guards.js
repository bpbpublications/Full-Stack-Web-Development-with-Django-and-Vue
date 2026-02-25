import { useUserStore } from '../stores/userStore'

export function requireAuth(to, from, next) {
  const userStore = useUserStore()
  
  if (!userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  next()
}

export function requireRole(roles) {
  return (to, from, next) => {
    const userStore = useUserStore()
    
    if (!userStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    if (!roles.includes(userStore.user.role)) {
      next({ name: 'forbidden' })
      return
    }
    
    next()
  }
}
