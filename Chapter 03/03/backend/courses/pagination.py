from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from .models import Course
from .serializers import CourseSerializer


class CoursePagination(PageNumberPagination):
    """Pagination class for Course objects.

    Provides customizable pagination with configurable page size.
    """
    page_size = 6
    page_query_param = 'page'
    page_size_query_param = 'page_size'
    max_page_size = 50


class CourseView(APIView):
    """API view for retrieving paginated courses.

    Provides GET endpoint to retrieve courses with pagination support.
    """
    pagination_class = CoursePagination

    def get(self, request):
        """Retrieve paginated courses.

        Args:
            request: The HTTP request object.

        Returns:
            Response: JSON response containing paginated course data.
        """
        courses = Course.objects.all()
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(courses, request)
        serializer = CourseSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data) 

 