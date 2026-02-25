<template>
  <div class="admin-instructors">
    <div class="header">
      <h1 class="page-title">Instructors</h1>
      <div class="filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Instructors</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by name, email, or specialization..."
            class="search-input"
            autocomplete="off"
            spellcheck="false"
          >
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-btn"
            type="button"
            aria-label="Clear search"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button @click="refreshInstructors" class="refresh-btn" :disabled="instructorStore.loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': instructorStore.loading }"></i>
          Refresh
        </button>
        <div class="export-buttons">
          <button @click="exportToCSV" class="export-btn">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button @click="exportToExcel" class="export-btn">
            <i class="fas fa-file-excel"></i> Export Excel
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ instructorStore.stats.total }}</div>
        <div class="stat-label">Total Instructors</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ instructorStore.stats.active }}</div>
        <div class="stat-label">Active Instructors</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ instructorStore.stats.pending }}</div>
        <div class="stat-label">Pending Approval</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ instructorStore.stats.avgRating.toFixed(1) }}</div>
        <div class="stat-label">Average Rating</div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="instructorStore.loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Loading instructors...</span>
    </div>
    
    <!-- Error state -->
    <div v-else-if="instructorStore.error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ instructorStore.error }}</p>
      <button @click="refreshInstructors" class="retry-btn">Retry</button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredInstructors.length === 0" class="empty-container">
      <p>No instructors found. {{ searchQuery ? 'Try a different search term.' : 'Add your first instructor to get started.' }}</p>
    </div>

    <div v-else class="instructors-grid">
      <div v-for="instructor in filteredInstructors" :key="instructor.id" class="instructor-card">
        <div class="instructor-avatar">
          <img v-if="instructor.avatar" :src="instructor.avatar" :alt="instructor.name" class="avatar-image">
          <span v-else class="avatar-initials">{{ getInitials(instructor.name) }}</span>
        </div>
        <div class="instructor-info">
          <h3>{{ instructor.name }}</h3>
          <p class="instructor-title">{{ instructor.specialization }}</p>
          <div class="instructor-stats">
            <span><i class="fas fa-book"></i> {{ instructor.courses }} courses</span>
            <span><i class="fas fa-users"></i> {{ instructor.students }} students</span>
            <span><i class="fas fa-star"></i> {{ instructor.rating.toFixed(1) }}</span>
          </div>
          <div class="instructor-actions">
            <button @click="viewProfile(instructor.id)" class="view-btn">
              View Profile
            </button>
            <button 
              @click="toggleStatus(instructor.id)" 
              :class="['status-btn', instructor.status]"
            >
              {{ instructor.status === 'active' ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="instructorStore.pagination.totalPages > 1" class="pagination">
      <button 
        @click="instructorStore.changePage(instructorStore.pagination.currentPage - 1)"
        :disabled="instructorStore.pagination.currentPage === 1"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="pagination-info">
        Page {{ instructorStore.pagination.currentPage }} of {{ instructorStore.pagination.totalPages }}
      </span>
      <button 
        @click="instructorStore.changePage(instructorStore.pagination.currentPage + 1)"
        :disabled="instructorStore.pagination.currentPage === instructorStore.pagination.totalPages"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInstructorStore } from '../../stores/instructorStore'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const instructorStore = useInstructorStore()
const { showToast } = useToast()

const statusFilter = ref('all')
const searchQuery = ref('')

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Computed property for filtered instructors
const filteredInstructors = computed(() => {
  return instructorStore.instructors
    .filter(instructor => {
      if (statusFilter.value === 'all') return true
      return instructor.status === statusFilter.value
    })
    .filter(instructor => {
      if (!searchQuery.value) return true
      return instructor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
             instructor.specialization.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
})

// Function to view instructor profile
const viewProfile = (instructorId) => {
  router.push(`/admin/instructors/${instructorId}`)
}

// Function to toggle instructor status
const toggleStatus = async (instructorId) => {
  try {
    // Find the instructor to get their name
    const instructor = instructorStore.instructors.find(i => i.id === instructorId)
    if (!instructor) {
      console.error('Instructor not found:', instructorId)
      showToast('Instructor not found', 'error')
      return
    }
    
    // Get the current status before toggling
    const currentStatus = instructor.status
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    console.log(`Toggling instructor ${instructor.name} (${instructorId}) from ${currentStatus} to ${newStatus}`)
    
    // Toggle the status
    await instructorStore.toggleInstructorStatus(instructorId)
    
    // Show success toast with instructor name and new status
    showToast(
      `${instructor.name}'s status changed to ${newStatus}`, 
      'success'
    )
  } catch (error) {
    console.error('Failed to toggle instructor status:', error)
    showToast('Failed to update instructor status', 'error')
  }
}

// Function to clear search
const clearSearch = () => {
  searchQuery.value = ''
}

// Export functionality
const exportToCSV = () => {
  try {
    const instructors = filteredInstructors.value
    if (instructors.length === 0) {
      showToast('No instructors to export', 'warning')
      return
    }

    // Create CSV headers
    const headers = ['Name', 'Email', 'Specialization', 'Courses', 'Students', 'Rating', 'Status']

    // Create CSV rows
    const rows = instructors.map(instructor => [
      instructor.name,
      instructor.email || '',
      instructor.specialization,
      instructor.courses,
      instructor.students,
      instructor.rating.toFixed(1),
      instructor.status
    ])

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `instructors_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Instructors exported to CSV successfully', 'success')
  } catch (error) {
    console.error('Failed to export CSV:', error)
    showToast('Failed to export CSV', 'error')
  }
}

const exportToExcel = () => {
  try {
    const instructors = filteredInstructors.value
    if (instructors.length === 0) {
      showToast('No instructors to export', 'warning')
      return
    }

    // For now, we'll export as CSV with .xlsx extension
    // In a real application, you'd use a library like xlsx
    const headers = ['Name', 'Email', 'Specialization', 'Courses', 'Students', 'Rating', 'Status']

    const rows = instructors.map(instructor => [
      instructor.name,
      instructor.email || '',
      instructor.specialization,
      instructor.courses,
      instructor.students,
      instructor.rating.toFixed(1),
      instructor.status
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `instructors_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Instructors exported to Excel successfully', 'success')
  } catch (error) {
    console.error('Failed to export Excel:', error)
    showToast('Failed to export Excel', 'error')
  }
}

// Function to refresh instructors
const refreshInstructors = async () => {
  try {
    console.log('Refreshing instructors with current filters:', {
      status: statusFilter.value,
      search: searchQuery.value
    })
    
    await instructorStore.fetchInstructors({
      status: statusFilter.value,
      search: searchQuery.value
    }, instructorStore.pagination.currentPage)
    
    await instructorStore.fetchInstructorStats()
    
    showToast('Instructor data refreshed', 'success')
  } catch (error) {
    console.error('Failed to refresh instructors:', error)
    showToast('Failed to refresh instructor data', 'error')
  }
}

// Watch for filter changes
watch([statusFilter, searchQuery], async (newValues, oldValues) => {
  // Only refetch if values actually changed
  if (newValues[0] === oldValues[0] && newValues[1] === oldValues[1]) return
  
  try {
    console.log('Filters changed, refetching instructors with:', {
      status: statusFilter.value,
      search: searchQuery.value
    })
    
    // When filters change, refetch instructors with the new filters
    await instructorStore.fetchInstructors({
      status: statusFilter.value,
      search: searchQuery.value
    })
  } catch (error) {
    console.error('Error applying filters:', error)
    showToast('Failed to apply filters', 'error')
  }
})

// Fetch data on component mount
onMounted(async () => {
  try {
    console.log('Instructors component mounted, fetching data...')
    
    // First fetch the instructors list
    await instructorStore.fetchInstructors()
    console.log('Instructors fetched successfully')
    
    // Then fetch detailed stats
    await instructorStore.fetchInstructorStats()
    console.log('Instructor stats fetched successfully')
  } catch (error) {
    console.error('Error fetching instructors or stats:', error)
    showToast('Failed to fetch instructors or stats', 'error')
  }
})
</script>

<style scoped>
.admin-instructors {
  padding: 0.5rem 2rem 2rem 2rem;
  margin-top: 72px; /* Exact height of admin header */
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 72px);
}

/* Ensure proper positioning on all screen sizes */
@media (min-width: 769px) {
  .admin-instructors {
    margin-top: 72px; /* Fixed admin header height */
    padding-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .admin-instructors {
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

.header .page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
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
  align-items: center;
  flex-wrap: wrap;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.export-btn {
  background: var(--accent-color);
  color: white;
  border: 2px solid var(--accent-color);
  border-radius: 6px;
  padding: 0.625rem 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(5, 184, 58, 0.2);
  white-space: nowrap;
}

.export-btn:hover {
  background: #048a32;
  border-color: #048a32;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(5, 184, 58, 0.3);
}

.export-btn i {
  font-size: 0.85rem;
}

.filter-select,
.search-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  min-width: 200px;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 250px;
}

.search-input {
  width: 100%;
  min-width: 250px;
  padding-right: 2.5rem; /* Make room for clear button */
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.clear-search-btn i {
  font-size: 0.75rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-color);
  color: var(--primary-bg);
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--accent-color-rgb), 0.3);
}

.refresh-btn:active {
  transform: translateY(0);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn i {
  font-size: 0.875rem;
}

.refresh-btn .fa-spin {
  animation: spin 1s linear infinite;
}

/* Light theme compatibility */
@media (prefers-color-scheme: light) {
  .filter-select,
  .search-input {
    background: var(--primary-bg);
    border-color: var(--border-light);
  }

  .filter-select:focus,
  .search-input:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
  }
}

/* Enhanced focus states for accessibility */
.filter-select:focus-visible,
.search-input:focus-visible,
.refresh-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Loading state for refresh button */
.refresh-btn.loading {
  pointer-events: none;
}

.refresh-btn.loading i {
  animation: spin 1s linear infinite;
}

/* Improved select dropdown styling */
.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

/* Search input enhancements */
.search-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3ccircle cx='11' cy='11' r='8'%3e%3c/circle%3e%3cpath d='m21 21-4.35-4.35'%3e%3c/path%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: left 0.75rem center;
  background-size: 1rem;
  padding-left: 2.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow);
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-top: 0.5rem;
}

.instructors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.instructor-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.instructor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.instructor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: var(--primary-bg);
  font-weight: 600;
  font-size: 1.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-initials {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.instructor-info {
  flex: 1;
}

.instructor-title {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.instructor-stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
}

.instructor-actions {
  display: flex;
  gap: 0.5rem;
}

.instructor-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.view-btn {
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

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  margin: 2rem 0;
}

.spinner {
  border: 4px solid var(--secondary-black);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  margin: 2rem 0;
  color: var(--error-color);
}

.error-container i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: var(--accent-color);
  color: var(--primary-black);
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  margin: 2rem 0;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.pagination-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s ease;
  margin: 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: var(--primary-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--accent-color-rgb), 0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.pagination-info {
  margin: 0 1rem;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

/* Responsive Design for Filters */
@media (min-width: 769px) {
  .header {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }

  .filters {
    flex-direction: row;
    gap: 1rem;
    align-items: center;
  }

  .filter-select {
    min-width: 200px;
  }

  .search-container {
    min-width: 250px;
  }

  .search-input {
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .filters {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-select,
  .search-input {
    width: 100%;
    min-width: unset;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.875rem;
  }

  .search-container {
    width: 100%;
    min-width: unset;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem;
  }

  .export-buttons {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .export-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .filters {
    gap: 0.5rem;
  }

  .filter-select,
  .search-input {
    padding: 0.75rem;
    font-size: 14px;
    border-radius: 4px;
  }

  .refresh-btn {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  .refresh-btn i {
    font-size: 0.8rem;
  }

  /* Hide export buttons on very small screens */
  .export-btn {
    display: none !important;
  }
}
</style>




