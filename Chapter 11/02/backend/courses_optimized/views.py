"""
Optimized Views with Performance Considerations


"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import OptimizedCourse, CourseStats
from .serializers import (
    OptimizedCourseSerializer,
    OptimizedCourseListSerializer,
    OptimizedCourseDetailSerializer
)


class CoursePagination(PageNumberPagination):
    """Custom pagination class for courses."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class OptimizedCourseListView(APIView):
    """
    List and Create Optimized Courses with Performance Optimization
    
    GET /api/courses-optimized/
    - Returns paginated list of active courses
    - Uses select_related and prefetch_related to avoid N+1 queries
    - Implements pagination to handle large datasets
    - Includes caching for frequently accessed data
    
    POST /api/courses-optimized/
    - Creates a new course (instructor only)
    """
    
    permission_classes = [AllowAny]
    pagination_class = CoursePagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'rating', 'created_at', 'enrolled']
    ordering = ['-created_at']
    
    def get(self, request):
        """
        Get optimized list of courses.
        
        Query optimization:
        - select_related('instructor'): Prevents N+1 on instructor
        - prefetch_related('stats'): Prevents N+1 on stats
        - filter(status='active'): Indexed field for fast filtering
        """

        cache_key = f"courses_list_page_{request.GET.get('page', 1)}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        

        queryset = OptimizedCourse.objects.optimized().filter(status='active')
        

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        instructor_id = request.query_params.get('instructor_id')
        if instructor_id:
            queryset = queryset.filter(instructor_id=instructor_id)
        

        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
        

        ordering = request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = OptimizedCourseListSerializer(
                page, 
                many=True, 
                context={'request': request}
            )
            result = paginator.get_paginated_response(serializer.data)
            
   
            cache.set(cache_key, result.data, 300)  
            
            return result
        
        serializer = OptimizedCourseListSerializer(
            queryset, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new course (instructor only)."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if request.user.role != 'instructor':
            return Response(
                {'error': 'Only instructors can create courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = OptimizedCourseSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save(instructor=request.user)
            
 
            CourseStats.objects.create(course=course)
            
  
            cache.delete_many([f"courses_list_page_{i}" for i in range(1, 11)])
            
            return Response(
                OptimizedCourseDetailSerializer(course, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OptimizedCourseDetailView(APIView):
    """
    Retrieve, Update, and Delete Individual Courses with Optimization
    
    GET /api/courses-optimized/<id>/
    - Returns full course details with stats
    - Uses select_related and prefetch_related for efficiency
    
    PUT /api/courses-optimized/<id>/
    - Update course (instructor only)
    
    DELETE /api/courses-optimized/<id>/
    - Delete course (instructor only)
    """
    
    permission_classes = [AllowAny]
    
    def get_course(self, course_id):
        """Get single course with all optimizations applied."""
        return get_object_or_404(
            OptimizedCourse.objects.optimized(),
            id=course_id
        )
    
    def get(self, request, course_id):
        """
        Get course details.
        
        Optimizations:
        - select_related('instructor'): Single query for instructor
        - prefetch_related('stats'): Single query for stats
        """
        course = self.get_course(course_id)
        serializer = OptimizedCourseDetailSerializer(
            course,
            context={'request': request}
        )
        return Response(serializer.data)
    
    def put(self, request, course_id):
        """Update course (instructor only)."""
        course = self.get_course(course_id)
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if course.instructor_id != request.user.id:
            return Response(
                {'error': 'You can only update your own courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = OptimizedCourseSerializer(
            course,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, course_id):
        """Delete course (instructor only)."""
        course = self.get_course(course_id)
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if course.instructor_id != request.user.id:
            return Response(
                {'error': 'You can only delete your own courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OptimizedCourseStatsView(APIView):
    """
    Get denormalized course statistics efficiently.
    
    GET /api/courses-optimized/<id>/stats/
    - Returns aggregated course statistics
    - Uses denormalized data for O(1) query time
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request, course_id):
        """Get course statistics."""
        course = get_object_or_404(OptimizedCourse, id=course_id)
        
   
        stats, created = CourseStats.objects.get_or_create(course=course)
        
        from .serializers import CourseStatsSerializer
        serializer = CourseStatsSerializer(stats)
        return Response(serializer.data)
