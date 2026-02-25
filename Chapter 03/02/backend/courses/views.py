from .models import Course
from .serializers import CourseSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache


class CourseView(APIView):
    """API view for managing Course objects.

    Provides CRUD operations for courses with caching support for GET requests.
    """

    serializer_class = CourseSerializer
    cache_key = 'courses'

    def get(self, request):
        """Retrieve all courses from cache or database.

        Args:
            request: The HTTP request object.

        Returns:
            Response: JSON response containing the list of courses.
        """
        cached_data = cache.get(self.cache_key)
        if cached_data:
            return Response(cached_data)

        courses = Course.objects.all()
        serializer = self.serializer_class(courses, many=True)
        data = serializer.data

        cache.set(self.cache_key, data)
        return Response(data)

    def post(self, request):
        """Create a new course.

        Args:
            request: The HTTP request object containing course data.

        Returns:
            Response: JSON response with the created course data or validation errors.
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        """Update an existing course.

        Args:
            request: The HTTP request object containing updated course data.
            pk: The primary key of the course to update.

        Returns:
            Response: JSON response with the updated course data or error message.
        """
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a course.

        Args:
            request: The HTTP request object.
            pk: The primary key of the course to delete.

        Returns:
            Response: Empty response with 204 status code or error message.
        """
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)