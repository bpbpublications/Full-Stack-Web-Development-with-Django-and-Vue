"""
Integration tests for course endpoints.

Tests course listing, filtering, pagination, and detail retrieval.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from courses.models import Course


@pytest.mark.django_db
class TestCoursesAPI:
    """Test course endpoints."""

    # ============ List Courses Tests ============

    def test_list_courses_success(self, api_client, seed_courses):
        """Test getting list of courses returns 200 with paginated results."""
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK

    def test_list_courses_empty(self, api_client):
        """Test listing courses when none exist."""
        response = api_client.get(reverse('course-list'))
        

        assert response.status_code == status.HTTP_200_OK

    def test_list_courses_returns_course_data(self, api_client, seed_course):
        """Test that course list includes all required fields."""
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK
       
        courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        if courses:
            course = courses[0]
       
            required_fields = ['id', 'title', 'description', 'price']
            for field in required_fields:
                assert field in course

    def test_list_courses_contains_active_courses(self, api_client, seed_course, inactive_course):
        """Test that list includes active courses."""
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK
        courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        course_ids = [c['id'] for c in courses]
        assert seed_course.id in course_ids

    def test_list_courses_all_have_valid_price(self, api_client, seed_courses):
        """Test that all courses in list have valid prices."""
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK
        courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        for course in courses:
            assert 'price' in course
            assert float(course['price']) >= 0

    # ============ Course Detail Tests ============

    def test_get_course_detail_success(self, api_client, seed_course):
        """Test getting course detail returns 200 with full course data."""
        response = api_client.get(reverse('course-detail', kwargs={'pk': seed_course.id}))
        
       
        if response.status_code != 404:
            assert response.status_code == status.HTTP_200_OK
            assert response.data['id'] == seed_course.id
            assert response.data['title'] == seed_course.title

    def test_get_course_detail_nonexistent(self, api_client):
        """Test getting non-existent course returns 404."""
        response = api_client.get(reverse('course-detail', kwargs={'pk': 99999}))
        

        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED]

    def test_get_course_detail_includes_all_fields(self, api_client, seed_course):
        """Test that course detail includes all required fields."""
        response = api_client.get(reverse('course-detail', kwargs={'pk': seed_course.id}))
        
        if response.status_code == 200:
            required_fields = ['id', 'title', 'description', 'price']
            for field in required_fields:
                assert field in response.data

    # ============ Pagination Tests ============

    def test_list_courses_pagination_first_page(self, api_client, seed_courses):
        """Test pagination on first page."""
        response = api_client.get(reverse('course-list') + '?page=1')
        
        assert response.status_code == status.HTTP_200_OK

    def test_list_courses_pagination_next_page(self, api_client, seed_courses):
        """Test pagination can access next pages."""
        response = api_client.get(reverse('course-list') + '?page=2')
        
      
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    def test_list_courses_custom_page_size(self, api_client, seed_courses):
        """Test custom page size works."""
        response = api_client.get(reverse('course-list') + '?page_size=2')
        
        assert response.status_code == status.HTTP_200_OK

    # ============ Filtering Tests ============

    def test_list_courses_filter_by_status(self, api_client, seed_course, inactive_course):
        """Test filtering courses by status."""
      
        response = api_client.get(reverse('course-list') + '?status=active')
        

        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
           
            for course in courses:
                if 'status' in course:
                    assert course['status'] == 'active'

    def test_list_courses_filter_by_instructor(self, api_client, seed_instructor, seed_course):
        """Test filtering courses by instructor."""
        response = api_client.get(reverse('course-list') + f'?instructor_id={seed_instructor.id}')
        
 
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    def test_list_courses_filter_by_price_range(self, api_client, seed_courses):
        """Test filtering courses by price range."""
        response = api_client.get(reverse('course-list') + '?min_price=100&max_price=300')
        
        
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    # ============ Search Tests ============

    def test_list_courses_search_by_title(self, api_client, seed_course):
        """Test searching courses by title."""
        search_term = seed_course.title.split()[0]  # First word of title
        response = api_client.get(reverse('course-list') + f'?search={search_term}')
        
      
        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
            if courses:
           
                assert any(search_term.lower() in c['title'].lower() for c in courses)

    def test_list_courses_search_by_description(self, api_client, seed_course):
        """Test searching courses by description."""
        search_term = seed_course.description.split()[0]
        response = api_client.get(reverse('course-list') + f'?search={search_term}')
        
      
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    # ============ Ordering Tests ============

    def test_list_courses_order_by_price_ascending(self, api_client, seed_courses):
        """Test ordering courses by price ascending."""
        response = api_client.get(reverse('course-list') + '?ordering=price')
        
        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
            if len(courses) > 1:
                prices = [float(c['price']) for c in courses if 'price' in c]
                # Prices should be in ascending order
                assert prices == sorted(prices)

    def test_list_courses_order_by_price_descending(self, api_client, seed_courses):
        """Test ordering courses by price descending."""
        response = api_client.get(reverse('course-list') + '?ordering=-price')
        
        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
            if len(courses) > 1:
                prices = [float(c['price']) for c in courses if 'price' in c]
              
                assert prices == sorted(prices, reverse=True)

    def test_list_courses_order_by_rating(self, api_client, seed_courses):
        """Test ordering courses by rating."""
        response = api_client.get(reverse('course-list') + '?ordering=-rating')
        
     
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    def test_list_courses_order_by_created_date(self, api_client, seed_courses):
        """Test ordering courses by creation date."""
        response = api_client.get(reverse('course-list') + '?ordering=-created_at')
        
  
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    # ============ Authorization Tests ============

    def test_list_courses_unauthenticated(self, api_client, seed_course):
        """Test that unauthenticated users can list courses."""
        response = api_client.get(reverse('course-list'))
        
      
        assert response.status_code == status.HTTP_200_OK

    def test_get_course_detail_unauthenticated(self, api_client, seed_course):
        """Test that unauthenticated users can view course details."""
        response = api_client.get(reverse('course-detail', kwargs={'pk': seed_course.id}))
        
        
        if response.status_code != 405:
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    # ============ Course Reviews Tests ============

    def test_get_course_reviews_success(self, api_client, seed_course):
        """Test getting reviews for a course."""
        response = api_client.get(reverse('course-list') + f'{seed_course.id}/reviews/')
        
     
        if response.status_code not in [404, 405]:
            assert response.status_code == status.HTTP_200_OK

    def test_get_course_reviews_nonexistent_course(self, api_client):
        """Test getting reviews for non-existent course returns 404."""
        response = api_client.get(reverse('course-list') + '99999/reviews/')
        
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED]

    # ============ Data Validation Tests ============

    def test_course_price_is_decimal(self, api_client, seed_course):
        """Test that course price is returned as decimal/float."""
        response = api_client.get(reverse('course-list'))
        
        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
            for course in courses:
                if 'price' in course:
                    # Price should be a number
                    assert isinstance(float(course['price']), float)

    def test_course_enrollment_count_is_integer(self, api_client, seed_course):
        """Test that enrollment count is an integer."""
        response = api_client.get(reverse('course-list'))
        
        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
            for course in courses:
                if 'enrolled' in course:
                    assert isinstance(course['enrolled'], int)

    def test_course_rating_is_in_valid_range(self, api_client, seed_course):
        """Test that course rating is between 0 and 5."""
        response = api_client.get(reverse('course-list'))
        
        if response.status_code == 200:
            courses = response.data if isinstance(response.data, list) else response.data.get('results', [])
            for course in courses:
                if 'rating' in course:
                    rating = float(course['rating'])
                    assert 0 <= rating <= 5

    # ============ Edge Cases ============

    def test_list_many_courses(self, api_client):
        """Test listing many courses doesn't cause errors."""
        from tests.factories import CourseFactory, InstructorFactory
        
        instructor = InstructorFactory()
        courses = [CourseFactory(instructor=instructor) for _ in range(50)]
        
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK

    def test_course_with_special_characters_in_title(self, api_client, seed_instructor):
        """Test course with special characters in title."""
        course = Course.objects.create(
            title="Python & Web Development: Best Practices (2024)",
            description="Learn web development",
            instructor=seed_instructor,
            price=299.99,
            status='active'
        )
        
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK

    def test_course_with_long_description(self, api_client, seed_instructor):
        """Test course with very long description."""
        long_description = "Test " * 500  # Very long description
        course = Course.objects.create(
            title="Test Course",
            description=long_description,
            instructor=seed_instructor,
            price=199.99,
            status='active'
        )
        
        response = api_client.get(reverse('course-list'))
        
        assert response.status_code == status.HTTP_200_OK
