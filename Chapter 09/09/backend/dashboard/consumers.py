import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from enrollments.models import Enrollment
from courses.models import Course
from notifications.models import Notification

logger = logging.getLogger(__name__)


class DashboardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated or isinstance(self.user, AnonymousUser):
            logger.warning(f"Unauthenticated user attempted WebSocket connection")
            await self.close(code=4001)
            return
        
        self.user_group_name = f'dashboard_user_{self.user.id}'
        
        try:
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            await self.accept()
            await self.send_initial_dashboard_data()
            logger.info(f"Dashboard WebSocket connected for user {self.user.id}")
        except Exception as e:
            logger.error(f"Error connecting dashboard WebSocket: {e}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.user_group_name,
                    self.channel_name
                )
                logger.info(f"Dashboard WebSocket disconnected for user {self.user.id}")
            except Exception as e:
                logger.error(f"Error disconnecting dashboard WebSocket: {e}")
    
    async def receive_json(self, content):
        try:
            message_type = content.get('type')
            
            if message_type == "request_update":
                await self.send_dashboard_update()
            elif message_type == "heartbeat":
                await self.send_json({"type": "heartbeat_response"})
            else:
                logger.warning(f"Unknown message type: {message_type}")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")
            await self.send_json({
                "type": "error",
                "message": "Failed to process request"
            })
    
    async def send_initial_dashboard_data(self):
        try:
            dashboard_data = await self.get_user_dashboard_data()
            await self.send_json({
                "type": "dashboard_update",
                "payload": dashboard_data
            })
        except Exception as e:
            logger.error(f"Error sending initial dashboard data: {e}")
            await self.send_json({
                "type": "error",
                "message": "Failed to load dashboard data"
            })
    
    async def send_dashboard_update(self):
        try:
            dashboard_data = await self.get_user_dashboard_data()
            await self.send_json({
                "type": "dashboard_update",
                "payload": dashboard_data
            })
        except Exception as e:
            logger.error(f"Error sending dashboard update: {e}")
            await self.send_json({
                "type": "error",
                "message": "Failed to update dashboard"
            })
    
    @database_sync_to_async
    def get_user_dashboard_data(self):
        try:
            user = self.user
            
            enrolled_courses = self._get_enrolled_courses(user)
            pending_notifications = self._get_pending_notifications(user)
            recent_enrollments = self._get_recent_enrollments(user)
            course_completion_stats = self._get_course_completion_stats(user)
            
            return {
                "enrolled_courses_count": len(enrolled_courses),
                "pending_notifications_count": pending_notifications['count'],
                "pending_notifications": pending_notifications['data'],
                "recent_enrollments": recent_enrollments,
                "course_completion_stats": course_completion_stats,
                "user_info": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_instructor": user.is_staff
                },
                "timestamp": timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting dashboard data for user {self.user.id}: {e}")
            return {
                "error": "Failed to retrieve dashboard data",
                "timestamp": timezone.now().isoformat()
            }
    
    def _get_enrolled_courses(self, user):
        try:
            enrollments = Enrollment.objects.filter(
                user=user,
                status='active'
            ).select_related('course').values_list('course', flat=True).distinct()
            
            courses = Course.objects.filter(id__in=enrollments).values(
                'id', 'title', 'instructor__username'
            )
            return list(courses)
        except Exception as e:
            logger.error(f"Error getting enrolled courses: {e}")
            return []
    
    def _get_pending_notifications(self, user):
        try:
            notifications = Notification.objects.filter(
                user=user,
                read=False
            ).order_by('-created_at')[:5]
            
            return {
                'count': Notification.objects.filter(user=user, read=False).count(),
                'data': [
                    {
                        'id': n.id,
                        'message': n.message,
                        'created_at': n.created_at.isoformat()
                    }
                    for n in notifications
                ]
            }
        except Exception as e:
            logger.error(f"Error getting pending notifications: {e}")
            return {'count': 0, 'data': []}
    
    def _get_recent_enrollments(self, user):
        try:
            enrollments = Enrollment.objects.filter(
                user=user
            ).order_by('-created_at')[:3]
            
            return [
                {
                    'course_id': e.object_id,
                    'course_name': e.course.title if hasattr(e, 'course') else 'N/A',
                    'status': e.status,
                    'enrolled_date': e.created_at.isoformat()
                }
                for e in enrollments
            ]
        except Exception as e:
            logger.error(f"Error getting recent enrollments: {e}")
            return []
    
    def _get_course_completion_stats(self, user):
        try:
            total_courses = Enrollment.objects.filter(
                user=user,
                status='active'
            ).count()
            
            return {
                'total_enrolled': total_courses,
                'in_progress': total_courses,
                'completed': 0
            }
        except Exception as e:
            logger.error(f"Error getting course completion stats: {e}")
            return {'total_enrolled': 0, 'in_progress': 0, 'completed': 0}
    
    async def dashboard_broadcast(self, event):
        try:
            await self.send_json(event)
        except Exception as e:
            logger.error(f"Error broadcasting dashboard message: {e}")
