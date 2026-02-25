from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course
from .serializers import CourseSerializer

class CourseView(APIView):
    def get(self, request):
        try:
            courses = Course.objects.all()
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException(f"Unexpected error: {str(e)}")

    def post(self, request):
        try:
            serializer = CourseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            raise APIException(f"Unexpected error: {str(e)}")