from django.urls import path
from .views import WelcomeMessage

urlpatterns = [
    path('welcome/', WelcomeMessage.as_view(), name='welcome'),
]
