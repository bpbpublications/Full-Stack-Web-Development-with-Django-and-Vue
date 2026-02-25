from django.urls import path
from .views import (
    RevenueAnalyticsView,
    StudentAnalyticsView,
    CourseAnalyticsView,
    CompletionBreakdownView,
    TopCoursesView,
    CategoryDistributionView
)

app_name = 'analytics'

urlpatterns = [
    path('revenue/', RevenueAnalyticsView.as_view(), name='revenue'),
    path('students/', StudentAnalyticsView.as_view(), name='students'),
    path('courses/', CourseAnalyticsView.as_view(), name='courses'),
    path('completion/', CompletionBreakdownView.as_view(), name='completion'),
    path('top-courses/', TopCoursesView.as_view(), name='top-courses'),
    path('categories/', CategoryDistributionView.as_view(), name='categories'),
]
