from rest_framework.filters import DjangoFilterBackend, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course
from .serializers import CourseSerializer


class CourseView(APIView):
    """API view for filtering and searching courses.

    Provides filtering by title and price, and searching by title and description.
    """
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['title', 'price']
    search_fields = ['title', 'description']

    def get(self, request):
        """Retrieve filtered and searched courses.

        Args:
            request: The HTTP request object.

        Returns:
            Response: JSON response containing filtered course data.
        """
        courses = Course.objects.all()
        for backend in self.filter_backends:
            courses = backend().filter_queryset(request, courses, self)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data) 

 