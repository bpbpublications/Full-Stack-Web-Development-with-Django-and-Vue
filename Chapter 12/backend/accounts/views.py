import logging
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.contrib.auth import update_session_auth_hash
from .models import CustomUser
from rest_framework.generics import ListAPIView
from .pagination import CustomPageNumberPagination
from django.db.models import Count, Avg, Sum

logger = logging.getLogger('auth')

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User Created Successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication for login
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'role': user.role,
                    }
                })
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'error': 'An error occurred during login'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({
            'message': 'Logout Successful'
        })

class UserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
   
    
    def post(self, request):
        email = request.data.get('email')
        user = get_user_model().objects.filter(email=email).first()
        
        if user:
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create reset link
            reset_link = f"{request.scheme}://{request.get_host()}/reset-password/{uid}/{token}"
            
            # Send email
            context = {
                'user': user,
                'reset_link': reset_link,
            }
            
            email_body = render_to_string('accounts/password_reset_email.html', context)
            
            send_mail(
                'Password Reset Request',
                email_body,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            
            logger.info(f'Password reset requested for user: {user.email}')
            return Response({'message': 'Password reset email sent'})
        
        return Response({'message': 'If an account exists with this email, a password reset link will be sent'})

class PasswordResetConfirmView(APIView):
  
    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                new_password = request.data.get('new_password')
                user.set_password(new_password)
                user.save()
                
                logger.info(f'Password reset successful for user: {user.email}')
                return Response({'message': 'Password reset successful'})
            else:
                logger.warning(f'Invalid password reset token for user: {user.email}')
                return Response(
                    {'error': 'Invalid or expired token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            logger.error(f'Password reset failed for token: {token}')
            return Response(
                {'error': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List users (admin only)"""
        if not request.user.is_administrator:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        users = get_user_model().objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        User = get_user_model()
        user = get_object_or_404(User, pk=pk)
        
        # Check if user has permission to view/modify this user
        if not self.request.user.is_administrator and self.request.user.id != user.id:
            return None
        return user

    def get(self, request, pk):
        """Get user details"""
        if pk == "me":
            user = request.user
        else:
            user = self.get_object(pk)
            if not user:
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Update user details"""
        if pk == "me":
            user = request.user
        else:
            user = self.get_object(pk)
            if not user:
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete user"""
        if pk == "me":
            return Response(
                {"error": "Cannot delete yourself through this endpoint"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = self.get_object(pk)
        if not user:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not request.user.is_administrator:
            return Response(
                {"error": "Only administrators can delete users"},
                status=status.HTTP_403_FORBIDDEN
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Change user password
        """
        if pk == "me":
            user = request.user
        else:
            User = get_user_model()
            user = get_object_or_404(User, pk=pk)
         
            if not request.user.is_administrator and request.user.id != user.id:
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'user': user}
        )

        if serializer.is_valid():
         
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
           
            update_session_auth_hash(request, user)
            
            return Response({
                'message': 'Password changed successfully'
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class StudentListView(ListAPIView):
    """
    List all students
    """
    queryset = CustomUser.objects.filter(role=CustomUser.Role.STUDENT)
    serializer_class = UserSerializer
    pagination_class = CustomPageNumberPagination
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(role=CustomUser.Role.STUDENT)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentDetailView(APIView):
    """
    Retrieve, update or delete a student
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(CustomUser, pk=pk, role=CustomUser.Role.STUDENT)
    
    def get(self, request, pk):
        student = self.get_object(pk)
        serializer = UserSerializer(student)
        return Response(serializer.data)
    
    def put(self, request, pk):
        student = self.get_object(pk)
        serializer = UserSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        student = self.get_object(pk)
        serializer = UserSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        student = self.get_object(pk)
    
        if not request.user.is_administrator and request.user.id != student.id:
            return Response(
                {"error": "Permission denied. Only administrators or the student themselves can delete this account."},
                status=status.HTTP_403_FORBIDDEN
            )
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class InstructorListView(APIView):
    """
    List all instructors or create a new instructor
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        instructors = CustomUser.objects.filter(role=CustomUser.Role.INSTRUCTOR)
        serializer = UserSerializer(instructors, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(role=CustomUser.Role.INSTRUCTOR)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstructorDetailView(APIView):
    """
    Retrieve, update or delete an instructor
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(CustomUser, pk=pk, role=CustomUser.Role.INSTRUCTOR)
    
    def get(self, request, pk):
        instructor = self.get_object(pk)
        serializer = UserSerializer(instructor)
        return Response(serializer.data)
    
    def put(self, request, pk):
        instructor = self.get_object(pk)
        serializer = UserSerializer(instructor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        instructor = self.get_object(pk)
        instructor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class StudentStatsView(APIView):
    """
    Get statistics about students
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
       
        if not (request.user.is_administrator or request.user.is_instructor):
            return Response(
                {"error": "Permission denied. Only administrators and instructors can access these statistics."},
                status=status.HTTP_403_FORBIDDEN
            )
        
     
        total_students = CustomUser.objects.filter(role=CustomUser.Role.STUDENT).count()
        
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_learners = CustomUser.objects.filter(
            role=CustomUser.Role.STUDENT,
            lesson_completions__completed_at__gte=thirty_days_ago
        ).distinct().count()
        

        completions = Enrollment.objects.filter(completed=True).count()

        from lessons.models import Lesson, LessonCompletion
        from django.db.models import Count, F, ExpressionWrapper, FloatField
        

        enrollments = Enrollment.objects.all()
        total_progress = 0
        valid_enrollments = 0
        
        for enrollment in enrollments:
            total_lessons = Lesson.objects.filter(module__course=enrollment.course).count()
            if total_lessons > 0:
                completed_lessons = LessonCompletion.objects.filter(
                    student=enrollment.student,
                    lesson__module__course=enrollment.course
                ).count()
                progress = (completed_lessons / total_lessons) * 100
                total_progress += progress
                valid_enrollments += 1
        
        avg_progress = round(total_progress / valid_enrollments, 1) if valid_enrollments > 0 else 0
        
        stats = {
            'totalStudents': total_students,
            'activeLearners': active_learners,
            'completions': completions,
            'avgProgress': avg_progress
        }
        
        return Response(stats)
