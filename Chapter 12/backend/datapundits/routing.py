from channels.routing import URLRouter
from django.urls import re_path
from dashboard import consumers as dashboard_consumers
from notifications import consumers as notifications_consumers

websocket_urlpatterns = [
    re_path(r'ws/dashboard/(?P<user_id>\d+)/$', dashboard_consumers.DashboardConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\d+)/$', notifications_consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/notifications/$', notifications_consumers.NotificationConsumer.as_asgi()),
]
