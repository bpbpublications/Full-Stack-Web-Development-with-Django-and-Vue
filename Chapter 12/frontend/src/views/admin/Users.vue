<template>
  <div class="admin-users">
    <div class="header">
      <h1>User Management</h1>
      <div class="filters">
        <select v-model="roleFilter" class="filter-select">
          <option value="all">All Users</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search users..." 
          class="search-input"
        >
      </div>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="user-info">
                <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="user-avatar">
                <div>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <span :class="['role-badge', user.role]">{{ user.role }}</span>
            </td>
            <td>
              <span :class="['status-badge', user.status]">{{ user.status }}</span>
            </td>
            <td>{{ formatDate(user.joinedDate) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="editUser(user)" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="toggleUserStatus(user)" :class="['status-btn', user.status]">
                  <i class="fas fa-power-off"></i>
                </button>
                <button @click="deleteUser(user)" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const roleFilter = ref('all')
const searchQuery = ref('')

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    status: 'active',
    joinedDate: '2023-01-15',
    avatar: null
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'instructor',
    status: 'active',
    joinedDate: '2023-02-20',
    avatar: null
  },
  // Add more mock users as needed
])

const filteredUsers = computed(() => {
  return users.value
    .filter(user => {
      if (roleFilter.value === 'all') return true
      return user.role === roleFilter.value
    })
    .filter(user => {
      if (!searchQuery.value) return true
      return user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const editUser = (user) => {
  // Implement edit user logic
  console.log('Edit user:', user)
}

const toggleUserStatus = (user) => {
  user.status = user.status === 'active' ? 'inactive' : 'active'
}

const deleteUser = (user) => {
  if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}
</script>

<style scoped>
.admin-users {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px; /* Exact height of admin header */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

/* Responsive positioning */
@media (min-width: 769px) {
  .admin-users {
    margin-top: 72px; /* Fixed admin header height */
    padding-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .admin-users {
    margin-top: 0; /* Admin header is relative on mobile */
    padding-top: 0.5rem;
  }
}

.header {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
  gap: 2rem;
}

.header h1 {
  margin: 0 !important;
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select,
.search-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--secondary-black);
  color: var(--text-primary);
}

.users-table {
  background: var(--secondary-black);
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background: var(--tertiary-black);
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: 500;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.role-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.role-badge.admin {
  background: var(--accent-color);
  color: var(--primary-black);
}

.role-badge.instructor {
  background: var(--success-color);
  color: var(--text-primary);
}

.role-badge.student {
  background: var(--info-color);
  color: var(--text-primary);
}

.status-badge.active {
  background: var(--success-color);
  color: var(--text-primary);
}

.status-badge.inactive {
  background: var(--error-color);
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: var(--accent-color);
  color: var(--primary-black);
}

.status-btn {
  background: var(--success-color);
  color: var(--text-primary);
}

.status-btn.inactive {
  background: var(--warning-color);
}

.delete-btn {
  background: var(--error-color);
  color: var(--text-primary);
}
</style>
