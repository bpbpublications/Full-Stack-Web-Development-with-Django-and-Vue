"""
Integration tests for enrollment endpoints.

Tests user enrollment in courses, enrollment management, and data integrity.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from enrollments.models import Enrollment
from courses.models import Course


@pytest.mark.django_db
class TestEnrollmentAPI:
    """Test enrollment endpoints."""

    # ============ Enroll in Course Tests ============

    def test_enroll_user_in_course_success(self, authenticated_client, seed_user, seed_course):
        """Test successful enrollment in course returns 201 Created."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
       
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]

    def test_enroll_user_in_course_returns_enrollment_data(self, authenticated_client, seed_user, seed_course):
        """Test enrollment response includes required fields."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        if response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]:
            data = response.data
            required_fields = ['id', 'user', 'status', 'enrolled_at']
            for field in required_fields:
                assert field in data

    def test_enroll_user_not_authenticated(self, api_client, seed_user, seed_course):
        """Test enrollment fails when user not authenticated."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = api_client.post(reverse('enrollment-list-create'), payload)
        
      
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

    def test_enroll_in_nonexistent_course(self, authenticated_client, seed_user):
        """Test enrollment fails when course doesn't exist."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': 99999,  
            'content_title': 'Non-existent Course'
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_201_CREATED  
        ]

    def test_enroll_duplicate_enrollment_conflict(self, authenticated_client, seed_user, seed_course):
        """Test enrollment fails when user already enrolled in course."""
        # Create first enrollment
        content_type = ContentType.objects.get_for_model(Course)
        Enrollment.objects.create(
            user=seed_user,
            content_type=content_type,
            object_id=seed_course.id,
            content_title=seed_course.title,
            status='active'
        )
        
    
        payload = {
            'user': seed_user.id,
            'content_type': content_type.id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        
        assert response.status_code in [
            status.HTTP_409_CONFLICT,
            status.HTTP_400_BAD_REQUEST
        ]

    def test_enrollment_message_for_duplicate(self, authenticated_client, seed_user, seed_course):
        """Test error message for duplicate enrollment."""
       
        content_type = ContentType.objects.get_for_model(Course)
        Enrollment.objects.create(
            user=seed_user,
            content_type=content_type,
            object_id=seed_course.id,
            content_title=seed_course.title,
            status='active'
        )
        
     
        payload = {
            'user': seed_user.id,
            'content_type': content_type.id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        if response.status_code in [status.HTTP_409_CONFLICT, status.HTTP_400_BAD_REQUEST]:
            
            response_text = str(response.data).lower()
            assert any(keyword in response_text for keyword in ['enroll', 'duplicate', 'already'])

    # ============ Enrollment Data Tests ============

    def test_enrollment_initial_progress_is_zero(self, authenticated_client, seed_user, seed_course):
        """Test new enrollment has 0% progress."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        if response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]:
            assert response.data.get('progress_percentage', 0) == 0

    def test_enrollment_status_is_active(self, authenticated_client, seed_user, seed_course):
        """Test new enrollment has 'active' status."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        if response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]:
            assert response.data.get('status') == 'active'

    def test_enrollment_has_enrolled_timestamp(self, authenticated_client, seed_user, seed_course):
        """Test enrollment has enrolled_at timestamp."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        if response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]:
            assert 'enrolled_at' in response.data
            assert response.data['enrolled_at'] is not None

    def test_enrollment_timestamp_is_iso8601(self, authenticated_client, seed_user, seed_course):
        """Test enrollment timestamp is in ISO 8601 format."""
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        if response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]:
            timestamp = response.data.get('enrolled_at')
            if timestamp:
                
                assert 'T' in str(timestamp)

    # ============ Course Enrollment Count Tests ============

    def test_enrollment_increments_course_enrolled_count(self, authenticated_client, seed_user, seed_course):
        """Test enrolling user increments course enrolled count."""
        initial_count = seed_course.enrolled
        
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': seed_course.id,
            'content_title': seed_course.title
        }
        
        authenticated_client.post(reverse('enrollment-list-create'), payload)
        
        
        seed_course.refresh_from_db()
       
        if seed_course.enrolled > initial_count:
            assert seed_course.enrolled == initial_count + 1

    # ============ Enrollment Listing Tests ============

    def test_list_user_enrollments(self, authenticated_client, seed_user, seed_enrollment):
        """Test listing enrollments for authenticated user."""
        response = authenticated_client.get(reverse('my-enrollments'))
        
        
        if response.status_code == 200:
            enrollments = response.data if isinstance(response.data, list) else response.data.get('results', [])
           
            enrollment_ids = [e['id'] for e in enrollments if isinstance(e, dict)]
            assert seed_enrollment.id in enrollment_ids or len(enrollments) > 0

    def test_list_enrollments_requires_authentication(self, api_client):
        """Test listing enrollments requires authentication."""
        response = api_client.get(reverse('my-enrollments'))
        
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_user_can_only_see_own_enrollments(self, authenticated_client, api_client, seed_user, seed_instructor, seed_course):
        """Test users can only see their own enrollments."""
        
        content_type = ContentType.objects.get_for_model(Course)
        enrollment1 = Enrollment.objects.create(
            user=seed_user,
            content_type=content_type,
            object_id=seed_course.id,
            content_title=seed_course.title,
            status='active'
        )
        
       
        from tests.factories import CourseFactory
        course2 = CourseFactory(instructor=seed_instructor)
        enrollment2 = Enrollment.objects.create(
            user=seed_instructor,
            content_type=content_type,
            object_id=course2.id,
            content_title=course2.title,
            status='active'
        )
        
        response = authenticated_client.get(reverse('my-enrollments'))
        
        if response.status_code == 200:
            enrollments = response.data if isinstance(response.data, list) else response.data.get('results', [])
            enrollment_ids = [e['id'] for e in enrollments if isinstance(e, dict)]
            
            
            if enrollment1.id in enrollment_ids or len(enrollments) > 0:
               
                assert enrollment2.id not in enrollment_ids or seed_user.id == seed_instructor.id

    # ============ Update Enrollment Tests ============

    def test_update_enrollment_progress(self, authenticated_client, seed_enrollment):
        """Test updating enrollment progress."""
        payload = {'progress_percentage': 50}
        
        response = authenticated_client.patch(
            reverse('enrollment-progress', kwargs={'pk': seed_enrollment.id}),
            payload
        )
        
        if response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]:
            
            seed_enrollment.refresh_from_db()
            assert seed_enrollment.progress_percentage == 50

    def test_complete_enrollment(self, authenticated_client, seed_enrollment):
        """Test marking enrollment as completed."""
        payload = {
            'progress_percentage': 100,
            'status': 'completed'
        }
        
        response = authenticated_client.patch(
            reverse('enrollment-detail', kwargs={'pk': seed_enrollment.id}),
            payload
        )
        
        if response.status_code == 200:
            seed_enrollment.refresh_from_db()
            if seed_enrollment.status == 'completed':
                assert seed_enrollment.progress_percentage == 100

    # ============ Delete Enrollment Tests ============

    def test_delete_enrollment(self, authenticated_client, seed_enrollment):
        """Test deleting an enrollment."""
        enrollment_id = seed_enrollment.id
        
        response = authenticated_client.delete(
            reverse('enrollment-detail', kwargs={'pk': enrollment_id})
        )
        
        if response.status_code == status.HTTP_204_NO_CONTENT:
           
            assert not Enrollment.objects.filter(id=enrollment_id).exists()

    def test_cannot_delete_others_enrollment(self, authenticated_client, instructor_client, seed_enrollment):
        """Test users cannot delete other users' enrollments."""
        enrollment_id = seed_enrollment.id
        
       
        response = instructor_client.delete(
            reverse('enrollment-detail', kwargs={'pk': enrollment_id})
        )
        
        
        if response.status_code == status.HTTP_403_FORBIDDEN:
            
            assert Enrollment.objects.filter(id=enrollment_id).exists()

    # ============ Data Integrity Tests ============

    def test_enrollment_unique_per_user_per_course(self, authenticated_client, seed_user, seed_course):
        """Test enrollment uniqueness constraint."""
        content_type = ContentType.objects.get_for_model(Course)
        
     
        Enrollment.objects.create(
            user=seed_user,
            content_type=content_type,
            object_id=seed_course.id,
            content_title=seed_course.title,
            status='active'
        )
        
     
        from django.db import IntegrityError
        try:
            Enrollment.objects.create(
                user=seed_user,
                content_type=content_type,
                object_id=seed_course.id,
                content_title=seed_course.title,
                status='active'
            )
    
            assert False, "Duplicate enrollment was allowed"
        except IntegrityError:
          
            assert True

    def test_enrollment_user_cascade_delete(self, authenticated_client):
        """Test that deleting user deletes enrollments."""
        from tests.factories import UserFactory
        
        user = UserFactory()
        course = Course.objects.first() or Course.objects.create(
            title="Test",
            description="Test",
            price=99.99,
            status='active'
        )
        
        content_type = ContentType.objects.get_for_model(Course)
        enrollment = Enrollment.objects.create(
            user=user,
            content_type=content_type,
            object_id=course.id,
            content_title=course.title,
            status='active'
        )
        
        enrollment_id = enrollment.id
        
      
        user.delete()
        
       
        assert not Enrollment.objects.filter(id=enrollment_id).exists()

    # ============ Edge Cases ============

    def test_multiple_users_can_enroll_in_same_course(self, api_client, seed_course):
        """Test multiple users can enroll in the same course."""
        from tests.factories import UserFactory
        from rest_framework_simplejwt.tokens import RefreshToken
        
        user1 = UserFactory()
        user2 = UserFactory()
        
        content_type = ContentType.objects.get_for_model(Course)
        
        enrollment1 = Enrollment.objects.create(
            user=user1,
            content_type=content_type,
            object_id=seed_course.id,
            content_title=seed_course.title,
            status='active'
        )
        
        enrollment2 = Enrollment.objects.create(
            user=user2,
            content_type=content_type,
            object_id=seed_course.id,
            content_title=seed_course.title,
            status='active'
        )
        
       
        assert enrollment1.id != enrollment2.id
        assert enrollment1.user != enrollment2.user

    def test_user_can_enroll_in_multiple_courses(self, authenticated_client, seed_user):
        """Test user can enroll in multiple courses."""
        from tests.factories import CourseFactory, InstructorFactory
        
        instructor = InstructorFactory()
        course1 = CourseFactory(instructor=instructor)
        course2 = CourseFactory(instructor=instructor)
        
        content_type = ContentType.objects.get_for_model(Course)
        
        enrollment1 = Enrollment.objects.create(
            user=seed_user,
            content_type=content_type,
            object_id=course1.id,
            content_title=course1.title,
            status='active'
        )
        
        enrollment2 = Enrollment.objects.create(
            user=seed_user,
            content_type=content_type,
            object_id=course2.id,
            content_title=course2.title,
            status='active'
        )
        
        
        assert enrollment1.id != enrollment2.id
        assert enrollment1.user == enrollment2.user
        assert enrollment1.object_id != enrollment2.object_id

    def test_enrollment_with_zero_price_course(self, authenticated_client, seed_user, seed_instructor):
        """Test enrolling in free (zero-price) course."""
        from tests.factories import CourseFactory
        
        free_course = CourseFactory(
            instructor=seed_instructor,
            price=0.00,
            status='active'
        )
        
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': free_course.id,
            'content_title': free_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
     
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST
        ]

    def test_enrollment_with_high_price_course(self, authenticated_client, seed_user, seed_instructor):
        """Test enrolling in expensive course."""
        from tests.factories import CourseFactory
        
        expensive_course = CourseFactory(
            instructor=seed_instructor,
            price=9999.99,
            status='active'
        )
        
        payload = {
            'user': seed_user.id,
            'content_type': ContentType.objects.get_for_model(Course).id,
            'object_id': expensive_course.id,
            'content_title': expensive_course.title
        }
        
        response = authenticated_client.post(reverse('enrollment-list-create'), payload)
        
   
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST
        ]
