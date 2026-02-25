"""URL routing for optimized courses app."""
from django.urls import path
from .views import (
    OptimizedCourseListView,
    OptimizedCourseDetailView,
    OptimizedCourseStatsView
)

app_name = 'courses_optimized'

urlpatterns = [
    
    path('', OptimizedCourseListView.as_view(), name='course-list'),
    
  
    path('<int:course_id>/', OptimizedCourseDetailView.as_view(), name='course-detail'),
    
 
    path('<int:course_id>/stats/', OptimizedCourseStatsView.as_view(), name='course-stats'),
]
