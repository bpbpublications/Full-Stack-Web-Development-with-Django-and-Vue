from django.urls import include, path
from .views import WelcomeMessage

urlpatterns = [
    path('welcome/', WelcomeMessage.as_view(), name='welcome'),
    path('auth/', include('accounts.urls')),
    path('courses/', include('courses.urls')),
    path('notifications/', include('notifications.urls')),
    path('analytics/', include('analytics.urls')),
]