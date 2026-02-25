from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from orders.models import Order, OrderItem
from enrollments.models import Enrollment
from reviews.models import Review
from courses.models import Course, Category
from django.contrib.auth import get_user_model

User = get_user_model()

class RevenueAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            days = min(int(request.GET.get('days', 30)), 365)  
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)

          
            daily_revenue = Order.objects.filter(
                status='completed',
                created_at__gte=start_date,
                created_at__lte=end_date
            ).annotate(
                date=TruncDate('created_at')
            ).values('date').annotate(
                daily_total=Sum('total_amount'),
                order_count=Count('id')
            ).order_by('date')

           
            labels = []
            values = []
            current_date = start_date.date()
            revenue_dict = {item['date']: float(item['daily_total']) for item in daily_revenue}

            while current_date <= end_date.date():
                labels.append(current_date.strftime('%Y-%m-%d'))
                values.append(revenue_dict.get(current_date, 0))
                current_date += timedelta(days=1)

         
            total_revenue = sum(values)
            total_orders = Order.objects.filter(
                status='completed',
                created_at__gte=start_date,
                created_at__lte=end_date
            ).count()

            
            previous_start = start_date - timedelta(days=days)
            previous_revenue = Order.objects.filter(
                status='completed',
                created_at__gte=previous_start,
                created_at__lt=start_date
            ).aggregate(total=Sum('total_amount'))['total'] or 0

            growth = ((total_revenue - float(previous_revenue)) / float(previous_revenue) * 100) if previous_revenue > 0 else 0

            return Response({
                'labels': labels,
                'values': values,
                'stats': {
                    'total': f"{total_revenue:.2f}",
                    'growth': round(growth, 1),
                    'averageOrder': f"{(total_revenue / total_orders):.2f}" if total_orders > 0 else "0.00",
                    'orderCount': total_orders
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class StudentAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            days = min(int(request.GET.get('days', 60)), 365)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)

          
            daily_students = User.objects.filter(
                date_joined__gte=start_date,
                date_joined__lte=end_date
            ).annotate(
                date=TruncDate('date_joined')
            ).values('date').annotate(
                student_count=Count('id')
            ).order_by('date')

   
            values = []
            current_date = start_date.date()
            students_dict = {item['date']: item['student_count'] for item in daily_students}

            while current_date <= end_date.date():
                labels.append(current_date.strftime('%Y-%m-%d'))
                values.append(students_dict.get(current_date, 0))
                current_date += timedelta(days=1)

         
            total_new_students = sum(values)
            total_active_students = User.objects.filter(is_active=True).count()

        
            previous_start = start_date - timedelta(days=days)
            previous_students = User.objects.filter(
                date_joined__gte=previous_start,
                date_joined__lt=start_date
            ).count()

            growth = ((total_new_students - previous_students) / previous_students * 100) if previous_students > 0 else 0

            return Response({
                'labels': labels,
                'values': values,
                'stats': {
                    'newStudents': total_new_students,
                    'totalActive': total_active_students,
                    'growth': round(growth, 1)
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class CourseAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            days = min(int(request.GET.get('days', 90)), 365)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)

            daily_enrollments = Enrollment.objects.filter(
                enrolled_at__gte=start_date,
                enrolled_at__lte=end_date
            ).annotate(
                date=TruncDate('enrolled_at')
            ).values('date').annotate(
                enrollment_count=Count('id')
            ).order_by('date')

           
            labels = []
            values = []
            current_date = start_date.date()
            enrollments_dict = {item['date']: item['enrollment_count'] for item in daily_enrollments}

            while current_date <= end_date.date():
                labels.append(current_date.strftime('%Y-%m-%d'))
                values.append(enrollments_dict.get(current_date, 0))
                current_date += timedelta(days=1)

            total_enrollments = sum(values)
            completed_enrollments = Enrollment.objects.filter(
                enrolled_at__gte=start_date,
                enrolled_at__lte=end_date,
                status='completed'
            ).count()

            completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0
            total_courses = Course.objects.filter(is_published=True).count()

            return Response({
                'labels': labels,
                'values': values,
                'stats': {
                    'totalEnrollments': total_enrollments,
                    'completionRate': round(completion_rate, 1),
                    'totalCourses': total_courses
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class CompletionBreakdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            days = min(int(request.GET.get('days', 120)), 365)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)

            enrollments = Enrollment.objects.filter(
                enrolled_at__gte=start_date,
                enrolled_at__lte=end_date
            )

            completed = enrollments.filter(status='completed').count()
            in_progress = enrollments.filter(
                status='active',
                last_accessed__isnull=False
            ).count()
            not_started = enrollments.filter(
                status='active',
                last_accessed__isnull=True
            ).count()

            return Response({
                'labels': ['Completed', 'In Progress', 'Not Started'],
                'values': [completed, in_progress, not_started]
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class TopCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            limit = min(int(request.GET.get('limit', 10)), 50)

          
            courses = Course.objects.filter(
                is_published=True
            ).annotate(
                enrollment_count=Count('enrollments'),
                total_revenue=Sum('orderitem__price', filter=Q(orderitem__order__status='completed')),
                average_rating=Avg('reviews__rating', filter=Q(reviews__is_approved=True))
            ).order_by('-enrollment_count', '-total_revenue')[:limit]

            course_data = []
            for course in courses:
                course_data.append({
                    'id': course.id,
                    'title': course.title,
                    'enrollments': course.enrollment_count or 0,
                    'revenue': float(course.total_revenue or 0),
                    'rating': round(course.average_rating or 0, 1)
                })

            return Response({
                'courses': course_data
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class CategoryDistributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            
            categories = Category.objects.annotate(
                enrollment_count=Count('courses__enrollments'),
                course_count=Count('courses', filter=Q(courses__is_published=True))
            ).order_by('-enrollment_count')

            labels = []
            values = []

            for category in categories:
                if category.enrollment_count > 0:
                    labels.append(category.name)
                    values.append(category.enrollment_count)

           
            uncategorized_count = Enrollment.objects.filter(
                content_type__model='course',
                content_object__category__isnull=True
            ).count()

            if uncategorized_count > 0:
                labels.append('Uncategorized')
                values.append(uncategorized_count)

            return Response({
                'labels': labels,
                'values': values
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)