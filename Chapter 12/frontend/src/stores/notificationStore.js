import { defineStore } from 'pinia';
import apiClient from '../services/apiClient';
import notificationService from '../services/notificationService';
import { useUserStore } from './userStore';

/**
 * Pinia store for notification management with WebSocket integration
 * Handles CRUD operations and real-time updates
 */
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true
    },
    filters: {
      type: null,
      read: null,
      dateFrom: null,
      dateTo: null
    },
    connectionStatus: 'disconnected',
    reconnectAttempts: 0,
    connectionTimeout: null,
    lastUpdateTime: 0,
    preferences: {
      email_live_class: true,
      email_course_update: true,
      email_private_message: true,
      email_grade_update: true,
      app_live_class: true,
      app_course_update: true,
      app_private_message: true,
      app_grade_update: true,
      digest_frequency: 'weekly',
    }
  }),

  getters: {
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    getByType: (state) => (type) => state.notifications.filter(n => n.notification_type === type),
    recentNotifications: (state) => state.notifications.slice(0, 5),
    hasUnreadNotifications: (state) => state.unreadCount > 0
  },

  actions: {
    async fetchNotifications(page = 1, filters = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        const params = {
          page,
          page_size: this.pagination.pageSize,
          ...filters
        };

        const response = await apiClient.get('/api/notifications/', { params });

        if (page === 1) {
          this.notifications = response.data.results || response.data;
        } else {
          this.notifications.push(...(response.data.results || response.data));
        }

        // Update pagination info
        if (response.data.count !== undefined) {
          this.pagination.total = response.data.count;
          this.pagination.hasMore = response.data.next !== null;
        }

        this.pagination.page = page;
        this.updateUnreadCount();

        console.log('Notifications fetched successfully:', this.notifications.length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        this.error = 'Failed to load notifications';
      } finally {
        this.isLoading = false;
      }
    },
    
    addNotification(notification) {
      // Validate required fields
      if (!notification.id && !notification.message) {
        console.warn('Invalid notification: missing required fields', notification);
        return;
      }

      const notificationId = notification.id || Date.now();
      
      // Check for duplicates
      if (this.notifications.some(n => n.id === notificationId)) {
        console.log('Notification already exists, skipping duplicate:', notificationId);
        return;
      }

      // Format and add to beginning of array
      const formattedNotification = {
        id: notificationId,
        notification_type: notification.type || notification.notification_type || 'general',
        title: notification.title || 'Notification',
        message: notification.message,
        icon: notification.icon || 'fas fa-bell',
        read: notification.read || false,
        time: notification.time || new Date().toISOString(),
        created_at: notification.created_at || new Date().toISOString()
      };

      this.notifications.unshift(formattedNotification);
      this.updateUnreadCount();

      console.log('New notification added:', formattedNotification);
    },

    async markAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        console.warn(`Notification ${notificationId} not found`);
        return;
      }

      const originalReadState = notification.read;

      try {
        // Update local state optimistically
        notification.read = true;
        this.updateUnreadCount();

        // Sync with API
        await apiClient.patch(`/api/notifications/${notificationId}/mark-read/`);

        // Also notify WebSocket
        if (notificationService.isConnected()) {
          notificationService.markAsRead(notificationId);
        }

        console.log(`Notification ${notificationId} marked as read`);
      } catch (error) {
        // Revert optimistic update on error
        notification.read = originalReadState;
        this.updateUnreadCount();
        
        console.error('Failed to mark notification as read:', error);
        this.error = 'Failed to mark notification as read';
      }
    },

    async markAllAsRead() {
      const originalStates = this.notifications.map(n => ({ id: n.id, read: n.read }));
      
      try {
        // Update local state optimistically
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        this.updateUnreadCount();

        // Sync with API
        await apiClient.patch('/api/notifications/mark-all-read/');

        console.log('All notifications marked as read');
      } catch (error) {
        // Revert optimistic update on error
        originalStates.forEach(original => {
          const notification = this.notifications.find(n => n.id === original.id);
          if (notification) {
            notification.read = original.read;
          }
        });
        this.updateUnreadCount();
        
        console.error('Failed to mark all notifications as read:', error);
        this.error = 'Failed to mark all notifications as read';
      }
    },

    async loadMoreNotifications() {
      if (!this.pagination.hasMore || this.isLoading) return;

      await this.fetchNotifications(this.pagination.page + 1, this.filters);
    },

    async refreshNotifications() {
      this.pagination.page = 1;
      this.pagination.hasMore = true;
      this.notifications = [];
      await this.fetchNotifications(1, this.filters);
    },
    
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    },

    setupWebSocket() {
      // Get user ID from user store
      const userStore = useUserStore();
      const userId = userStore.user?.id;

      if (!userId) {
        console.warn('Cannot setup WebSocket: User ID not available');
        this.connectionStatus = 'fallback';
        return;
      }

      console.log(`🔌 Setting up WebSocket for user ID: ${userId}`);
      this.connectionStatus = 'connecting';

      // Clear any existing timeout
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }

      // Set 10 second timeout for WebSocket connection
      this.connectionTimeout = setTimeout(() => {
        if (this.connectionStatus === 'connecting') {
          console.warn('⚠️ WebSocket connection timeout - switching to fallback mode');
          this.connectionStatus = 'fallback';
        }
      }, 10000);

      notificationService.setCallbacks({
        onMessage: (notification) => {
          // Debounce rapid updates
          const now = Date.now();
          if (now - this.lastUpdateTime < 100) {
            console.log('Rapid updates detected, debouncing...');
            return;
          }
          this.lastUpdateTime = now;
          
          console.log('WebSocket notification received:', notification);
          this.addNotification(notification);
        },
        onConnect: () => {
          console.log('✅ WebSocket connected successfully');
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          this.isConnected = true;
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.error = null;
        },
        onDisconnect: () => {
          console.log('🔌 WebSocket disconnected - running in fallback mode');
          this.isConnected = false;
          this.connectionStatus = 'fallback';
          this.error = null;
        },
        onError: (error) => {
          console.warn('⚠️ WebSocket connection failed - real-time notifications disabled:', error);
          this.connectionStatus = 'fallback';
          this.error = null;
          this.isConnected = false;
        },
        onReconnecting: (attempts, delay) => {
          console.log(`🔄 WebSocket reconnecting... Attempt ${attempts}, delay: ${delay}ms`);
          this.connectionStatus = 'connecting';
          this.reconnectAttempts = attempts;
        }
      });

      notificationService.connect(userId);
    },

    cleanupWebSocket() {
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      notificationService.disconnect();
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
    },

    async fetchPreferences() {
      try {
        const response = await apiClient.get('/api/notifications/preferences/');
        this.preferences = response.data;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching preferences:', error);
        return { success: false, error: error.message };
      }
    },

    async updatePreferences(newPreferences) {
      const originalPreferences = { ...this.preferences };
      
      try {
     
        this.preferences = { ...this.preferences, ...newPreferences };
        

        const response = await apiClient.put('/api/notifications/preferences/', newPreferences);
        this.preferences = response.data;
        return { success: true };
      } catch (error) {
       
        this.preferences = originalPreferences;
        console.error('Error updating preferences:', error);
        return { success: false, error: error.message };
      }
    }
  }
});