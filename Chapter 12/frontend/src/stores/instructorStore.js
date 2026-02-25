import { defineStore } from 'pinia'
import { instructorService } from '../services/instructorService'

export const useInstructorStore = defineStore('instructor', {
  state: () => ({
    instructors: [],
    selectedInstructor: null,
    stats: {
      total: 0,
      active: 0,
      pending: 0,
      avgRating: 0
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10
    },
    loading: false,
    error: null,
    currentFilters: {
      status: 'all',
      search: ''
    }
  }),
  
  actions: {
    async fetchInstructors(filters = {}, page = 1) {
      this.loading = true
      this.error = null
      
      // Store current filters for reuse
      this.currentFilters = {
        status: filters.status || 'all',
        search: filters.search || ''
      }
      
      try {
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), 15000)
        })
        
        // Race the actual request with the timeout
        const response = await Promise.race([
          instructorService.getAllInstructors(filters, page, this.pagination.pageSize),
          timeoutPromise
        ])
        
        console.log('Instructor list API response:', response.data)
        
        // Handle different API response formats
        let instructorResults = [];
        let totalCount = 0;
        
        if (Array.isArray(response.data)) {
          // Direct array format
          instructorResults = response.data;
          totalCount = response.data.length;
          console.log('API returned direct array format with', totalCount, 'instructors');
        } else if (response.data && Array.isArray(response.data.results)) {
          // Object with results array format
          instructorResults = response.data.results;
          totalCount = response.data.count || instructorResults.length;
          console.log('API returned results object format with', totalCount, 'instructors');
        } else if (response.data && typeof response.data === 'object') {
          // Handle any other object format by trying to extract data
          console.warn('Unexpected object format, attempting to extract data');
          if (response.data.data && Array.isArray(response.data.data)) {
            instructorResults = response.data.data;
            totalCount = instructorResults.length;
          } else {
            // Try to convert object to array if possible
            const possibleArray = Object.values(response.data).filter(item => 
              item && typeof item === 'object' && 'id' in item
            );
            if (possibleArray.length > 0) {
              instructorResults = possibleArray;
              totalCount = possibleArray.length;
            } else {
              console.error('Could not extract instructor data from response:', response.data);
              throw new Error('Invalid response format from API');
            }
          }
        } else {
          console.error('Unexpected API response format:', response.data);
          throw new Error('Invalid response format from API');
        }
        
        // Map the instructor data with more flexible field mapping
        this.instructors = instructorResults.map(instructor => {
          // Log each instructor for debugging
          console.log('Processing instructor:', instructor);
          
          return {
            id: instructor.id,
            name: instructor.name || instructor.full_name || instructor.user?.full_name || 'Unknown',
            specialization: instructor.specialization || instructor.title || instructor.role || 'Instructor',
            courses: instructor.courses_count || instructor.courses || 0,
            students: instructor.students_count || instructor.students || 0,
            rating: instructor.average_rating || instructor.rating || 0,
            status: instructor.is_active === undefined 
              ? (instructor.status === 'active' ? 'active' : 'inactive')
              : (instructor.is_active ? 'active' : 'inactive'),
            avatar: instructor.avatar || instructor.profile_image || instructor.image || null,
            email: instructor.email || instructor.user?.email || ''
          };
        });
        
        // Update pagination information
        this.pagination = {
          currentPage: page,
          totalPages: Math.ceil(totalCount / this.pagination.pageSize),
          totalItems: totalCount,
          pageSize: this.pagination.pageSize
        }
        
        // Update stats based on the response
        this.stats.total = totalCount;
        
        // Calculate active instructors count
        const activeInstructors = this.instructors.filter(i => i.status === 'active').length
        this.stats.active = activeInstructors
        this.stats.pending = this.stats.total - activeInstructors
        
        return this.instructors
      } catch (error) {
        this.error = error.message || 'Failed to fetch instructors'
        console.error('Error fetching instructors:', error)
        this.instructors = []
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchInstructorStats() {
      try {
        const response = await instructorService.getInstructorStats()
        
        if (!response.data) {
          throw new Error('Invalid response format from instructor stats API')
        }
        
        const data = response.data
        
        // Update stats with proper fallbacks
        this.stats = {
          total: typeof data.total === 'number' ? data.total : this.stats.total,
          active: typeof data.active === 'number' ? data.active : this.stats.active,
          pending: typeof data.pending === 'number' ? data.pending : this.stats.pending,
          avgRating: typeof data.average_rating === 'number' ? data.average_rating : this.stats.avgRating
        }
        
        return this.stats
      } catch (error) {
        console.error('Error in fetchInstructorStats:', error)
        // Don't reset stats to zero if there's an error
        throw error
      }
    },
    
    async fetchInstructorById(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await instructorService.getInstructorById(id)
        
        if (!response.data) {
          throw new Error('Invalid response format from instructor details API')
        }
        
        const instructor = response.data
        
        // Map the instructor data to our format
        this.selectedInstructor = {
          id: instructor.id,
          name: instructor.name || instructor.user?.full_name || 'Unknown',
          specialization: instructor.specialization || instructor.title || 'Instructor',
          courses: instructor.courses_count || 0,
          students: instructor.students_count || 0,
          rating: instructor.average_rating || 0,
          status: instructor.is_active ? 'active' : 'inactive',
          avatar: instructor.avatar || instructor.profile_image || null,
          email: instructor.email || instructor.user?.email || '',
          phone: instructor.phone || '',
          website: instructor.website || '',
          bio: instructor.bio || instructor.description || '',
          coursesList: instructor.courses || [],
          reviews: instructor.reviews || []
        }
        
        return this.selectedInstructor
      } catch (error) {
        this.error = error.message || 'Failed to fetch instructor details'
        console.error(`Error fetching instructor ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async toggleInstructorStatus(instructorId) {
      const instructor = this.instructors.find(i => i.id === instructorId)
      if (!instructor) {
        console.error('Instructor not found in store:', instructorId)
        throw new Error('Instructor not found')
      }
      
      // Store the current status
      const currentStatus = instructor.status
      
      // Optimistically update the UI
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      instructor.status = newStatus
      
      try {
        // Call the API to update the status
        const response = await instructorService.toggleInstructorStatus(
          instructorId, 
          newStatus === 'active'
        )
        
        // Update stats after successful toggle
        if (newStatus === 'active') {
          this.stats.active++
          this.stats.pending--
        } else {
          this.stats.active--
          this.stats.pending++
        }
        
        return response.data
      } catch (error) {
        // Revert the optimistic update on error
        instructor.status = currentStatus
        console.error('Error toggling instructor status:', error)
        throw error
      }
    },
    
    async changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      
      // Update current page immediately for UI feedback
      this.pagination.currentPage = newPage
      
      // Fetch the new page data using the stored filters
      await this.fetchInstructors(this.currentFilters, newPage)
    }
  }
})



