import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Notification
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from enrollments.models import Enrollment
from courses.models import Course
from django.db import transaction

logger = logging.getLogger(__name__)

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = None
        self.user_group_name = None
        self.user_courses = []
        self.url_user_id = None
        self.connection_established = False

        try:
            self.user = self.scope["user"]

            self.url_user_id = self.scope['url_route']['kwargs'].get('user_id')

            if not self.user.is_authenticated:
                await self.close(code=4001)
                return

            if self.url_user_id and int(self.url_user_id) != self.user.id:
                await self.close(code=4003)
                return

            self.user_group_name = f'user_{self.user.id}'

            if self.channel_layer is not None:
                await self.channel_layer.group_add(
                    self.user_group_name,
                    self.channel_name
                )

                if self.user.is_staff or self.user.is_superuser:
                    await self.channel_layer.group_add(
                        'admin_notifications',
                        self.channel_name
                    )

                try:
                    self.user_courses = await self.get_user_courses()
                    for course_id in self.user_courses:
                        await self.channel_layer.group_add(
                            f'course-updates-{course_id}',
                            self.channel_name
                        )
                except Exception as e:
                    logger.warning(f"Failed to get user courses for WebSocket: {e}")
                    self.user_courses = []

            self.connection_established = True
            await self.accept()

        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """
        Safely handle WebSocket disconnection with comprehensive error handling
        """
        try:
            if (self.channel_layer is not None and
                getattr(self, 'connection_established', False)):

                user_group_name = getattr(self, 'user_group_name', None)
                if user_group_name:
                    try:
                        await self.channel_layer.group_discard(
                            user_group_name,
                            self.channel_name
                        )
                    except Exception as e:
                        logger.warning(f"Error leaving user group: {e}")

                user = getattr(self, 'user', None)
                if user and hasattr(user, 'is_staff') and (user.is_staff or user.is_superuser):
                    try:
                        await self.channel_layer.group_discard(
                            'admin_notifications',
                            self.channel_name
                        )
                    except Exception as e:
                        logger.warning(f"Error leaving admin group: {e}")

                user_courses = getattr(self, 'user_courses', [])
                if user_courses and isinstance(user_courses, list):
                    for course_id in user_courses:
                        try:
                            await self.channel_layer.group_discard(
                                f'course-updates-{course_id}',
                                self.channel_name
                            )
                        except Exception as e:
                            logger.warning(f"Error leaving course group {course_id}: {e}")

        except Exception as e:
            logger.error(f"Unexpected error in WebSocket disconnect: {e}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages with validation"""
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logger.warning("Invalid JSON received from WebSocket")
            return
        
        message_type = data.get('type')
        
        if message_type == 'mark_read':
            notification_id = data.get('notification_id')
            
            if not notification_id or not isinstance(notification_id, int):
                logger.warning(f"Invalid notification_id: {notification_id}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Invalid notification_id'
                }))
                return
            
            success = await self.mark_notification_read(notification_id)
            
            await self.send(text_data=json.dumps({
                'type': 'notification_marked_read',
                'notification_id': notification_id,
                'success': success
            }))
        else:
            logger.warning(f"Unknown message type received: {message_type}")
    
    async def notification_message(self, event):
        """Handler for notification_message event from channel layer"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    @database_sync_to_async
    def get_user_courses(self):
        """Get course IDs that the user is enrolled in with comprehensive error handling"""
        try:
            if not self.user or not hasattr(self.user, 'id'):
                return []

            course_content_type = ContentType.objects.get_for_model(Course)
            enrollments = Enrollment.objects.filter(
                user=self.user,
                content_type=course_content_type,
                status='active'
            ).values_list('object_id', flat=True)

            course_ids = list(enrollments)
            logger.debug(f"Found {len(course_ids)} active course enrollments for user {self.user.id}")
            return course_ids

        except Exception as e:
            logger.error(f"Error getting user courses for WebSocket: {e}")
            return []
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read with atomic transaction"""
        try:
            with transaction.atomic():
                notification = Notification.objects.select_for_update().get(
                    id=notification_id,
                    user=self.user
                )
                if not notification.read:
                    notification.read = True
                    notification.save(update_fields=['read'])
                    logger.debug(f"Marked notification {notification_id} as read for user {self.user.id}")
                return True
        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {self.user.id}")
            return False
        except Exception as e:
            logger.error(f"Error marking notification {notification_id} as read: {e}")
            return False