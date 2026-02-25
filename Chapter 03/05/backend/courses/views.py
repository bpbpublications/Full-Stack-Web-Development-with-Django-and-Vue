from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course
from .serializers import CourseSerializer
from .exceptions import CourseNotFoundException, CourseAlreadyExistsException

class CourseView(APIView):
    def get(self, request):
        try:
            courses = Course.objects.all()
            if not courses.exists():
                raise CourseNotFoundException()
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CourseNotFoundException as e:
            raise e

    def post(self, request):
        try:
            if Course.objects.filter(name=request.data.get('name')).exists():
                raise CourseAlreadyExistsException()
            serializer = CourseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except (CourseAlreadyExistsException, CourseNotFoundException) as e:
            raise e