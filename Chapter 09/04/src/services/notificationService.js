/**
 * WebSocket-based notification service for real-time updates
 * Connects to Django Channels backend for live notifications
 */
class NotificationService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.heartbeatInterval = null;
    this.userId = null;
    this.callbacks = {
      onMessage: null,
      onConnect: null,
      onDisconnect: null,
      onError: null,
      onReconnecting: null
    };
  }

  /**
   * Establish WebSocket connection to the backend
   * @param {number} userId - The user ID for the WebSocket connection
   * @param {boolean} isReconnect - Whether this is a reconnection attempt
   */
  connect(userId = null, isReconnect = false) {
    if (userId) {
      this.userId = userId;
    }

    if (!this.userId) {
      console.error('WebSocket connection failed: User ID is required');
      if (this.callbacks.onError) {
        this.callbacks.onError(new Error('User ID is required for WebSocket connection'));
      }
      return;
    }

    if (this.socket) {
      this.socket.close();
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NODE_ENV === 'development' ? 'localhost:8080' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws/notifications/${this.userId}/`;

      console.log(`🔌 Attempting to connect to WebSocket: ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        if (this.callbacks.onConnect) {
          this.callbacks.onConnect();
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          switch (data.type) {
            case 'notification':
              if (this.callbacks.onMessage) {
                this.callbacks.onMessage(data.notification);
              }
              break;
            case 'notification_marked_read':
              console.log(`Notification ${data.notification_id} marked as read`);
              break;
            case 'pong':
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket connection failed. Real-time notifications will be disabled.');
        console.log('To enable real-time notifications, ensure the Django backend is running with ASGI support.');
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`🔌 WebSocket connection closed: Code ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        this.connected = false;
        this.stopHeartbeat();

        if (event.code === 4001) {
          console.error('❌ WebSocket authentication failed - user not authenticated');
        } else if (event.code === 4003) {
          console.error('❌ WebSocket authorization failed - user cannot access this channel');
        } else if (event.code === 1006) {
          console.log('🔌 WebSocket endpoint not available. Running in fallback mode without real-time notifications.');
        }

        if (this.callbacks.onDisconnect) {
          this.callbacks.onDisconnect();
        }

        const shouldReconnect = event.code !== 1000 &&
                               event.code !== 4001 &&
                               event.code !== 4003 &&
                               this.reconnectAttempts < this.maxReconnectAttempts;

        if (shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }
  
  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    if (this.callbacks.onReconnecting) {
      this.callbacks.onReconnecting(this.reconnectAttempts, delay);
    }

    setTimeout(() => {
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect(null, true);
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Mark a notification as read
   * @param {string|number} notificationId - ID of the notification to mark as read
   */
  markAsRead(notificationId) {
    if (this.connected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'mark_read',
        notification_id: notificationId
      }));
    } else {
      console.warn('Cannot mark notification as read: WebSocket not connected');
    }
  }

  /**
   * Mark multiple notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   */
  markMultipleAsRead(notificationIds) {
    if (this.connected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'mark_multiple_read',
        notification_ids: notificationIds
      }));
    } else {
      console.warn('Cannot mark notifications as read: WebSocket not connected');
    }
  }

  /**
   * Send a custom message through the WebSocket
   * @param {Object} message - Message object to send
   */
  sendMessage(message) {
    if (this.connected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Set callback functions for various events
   * @param {Object} callbacks - Object containing callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Disconnect from WebSocket and clean up
   */
  disconnect() {
    console.log('Disconnecting WebSocket');
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }

    this.connected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Get current connection status
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state information
   * @returns {Object} Connection state details
   */
  getConnectionState() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      readyState: this.socket ? this.socket.readyState : null
    };
  }
}

export default new NotificationService();