from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    # Authentication endpoints
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<str:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:pk>/change-password/', 
         views.ChangePasswordView.as_view(), 
         name='change-password'),
         
    # Student endpoints
    path('students/', views.StudentListView.as_view(), name='student-list'),
    path('students/<int:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
    
    # Instructor endpoints
    path('instructors/', views.InstructorListView.as_view(), name='instructor-list'),
    path('instructors/<int:pk>/', views.InstructorDetailView.as_view(), name='instructor-detail'),
    
    
    #Students stats
    path('students/stats/', views.StudentStatsView.as_view(), name='student-stats'),
]
