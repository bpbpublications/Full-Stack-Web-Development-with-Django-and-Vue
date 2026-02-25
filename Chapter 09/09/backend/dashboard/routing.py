from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/dashboard/<int:user_id>/", consumers.DashboardConsumer.as_asgi(), name="dashboard"),
]
