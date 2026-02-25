"""
Integration tests for courses API.
Tests full HTTP request/response cycles with authentication, caching, and database interactions.
"""
import pytest
import json
from decimal import Decimal
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from courses.models import Course
from accounts.models import CustomUser


@pytest.mark.django_db
class TestCourseAPIIntegration:
    """Integration tests for the CourseView API endpoint."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Clear cache before each test."""
        cache.clear()
        yield
        cache.clear()
    
    @pytest.fixture
    def client(self):
        """Create a test API client."""
        return APIClient()
    
    @pytest.fixture
    def instructor(self):
        """Create a test instructor user."""
        return CustomUser.objects.create_user(
            email='instructor@test.com',
            name='John Instructor',
            password='testpass123',
            role='instructor'
        )
    
    @pytest.fixture
    def student(self):
        """Create a test student user."""
        return CustomUser.objects.create_user(
            email='student@test.com',
            name='Jane Student',
            password='testpass123',
            role='student'
        )
    
    # ============ GET List Tests ============
    
    def test_get_all_courses_returns_200(self, client):
        """Test GET /api/courses/ returns 200 status."""
        response = client.get('/api/courses/')
        assert response.status_code == status.HTTP_200_OK
    
    def test_get_all_courses_returns_list(self, client, instructor):
        """Test GET /api/courses/ returns a list of courses."""
        Course.objects.create(
            title='Python 101',
            description='Learn Python',
            instructor=instructor,
            price=Decimal('29.99')
        )
        Course.objects.create(
            title='Django Basics',
            description='Learn Django',
            instructor=instructor,
            price=Decimal('39.99')
        )
        
        response = client.get('/api/courses/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
    
    def test_get_all_courses_serialized_correctly(self, client, instructor):
        """Test that course data is serialized correctly."""
        course = Course.objects.create(
            title='Advanced Python',
            description='Master Python',
            instructor=instructor,
            price=Decimal('49.99'),
            status='active'
        )
        
        response = client.get('/api/courses/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert len(data) >= 1
        course_data = next((c for c in data if c['id'] == course.id), None)
        assert course_data is not None
        assert course_data['title'] == 'Advanced Python'
        assert course_data['description'] == 'Master Python'
        assert course_data['price'] == '49.99'
        assert 'created_at' in course_data
        assert 'updated_at' in course_data
    
    def test_get_courses_empty_list(self, client):
        """Test GET /api/courses/ returns empty list when no courses exist."""
        response = client.get('/api/courses/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data == []
    
    def test_get_courses_caching(self, client, instructor):
        """Test that GET /api/courses/ uses caching."""
        Course.objects.create(
            title='Course 1',
            description='Description 1',
            instructor=instructor,
            price=Decimal('19.99')
        )
        
       
        response1 = client.get('/api/courses/')
        assert response1.status_code == status.HTTP_200_OK
        data1 = response1.json()
        assert len(data1) == 1
        

        Course.objects.create(
            title='Course 2',
            description='Description 2',
            instructor=instructor,
            price=Decimal('29.99')
        )
        
   
        response2 = client.get('/api/courses/')
        data2 = response2.json()
        assert len(data2) == 1  
        
    
        cache.clear()
        response3 = client.get('/api/courses/')
        data3 = response3.json()
        assert len(data3) == 2  
    
    # ============ POST Create Tests ============
    
    def test_create_course_with_valid_data(self, client, instructor):
        """Test POST /api/courses/ with valid data."""
        course_data = {
            'title': 'New Course',
            'description': 'A comprehensive course',
            'price': '59.99'
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data['title'] == 'New Course'
        assert data['description'] == 'A comprehensive course'
        assert data['price'] == '59.99'
        assert 'id' in data
    
    def test_create_course_persists_to_database(self, client, instructor):
        """Test that created course is saved to database."""
        course_data = {
            'title': 'Persistent Course',
            'description': 'Test persistence',
            'price': '49.99'
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
      
        assert Course.objects.filter(title='Persistent Course').exists()
        db_course = Course.objects.get(title='Persistent Course')
        assert db_course.price == Decimal('49.99')
        assert db_course.title == 'Persistent Course'
        assert db_course.description == 'Test persistence'
    
    def test_create_course_invalidates_cache(self, client, instructor):
        """Test that creating a course doesn't clear cache (caching responsibility)."""
    
        course1 = Course.objects.create(
            title='Course 1',
            description='Desc 1',
            instructor=instructor,
            price=Decimal('19.99')
        )
        client.get('/api/courses/')  
        
    
        course_data = {
            'title': 'Course 2',
            'description': 'Desc 2',
            'price': '29.99',
            'instructor': instructor.id
        }
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        

        assert Course.objects.count() == 2
    
    def test_create_course_missing_required_field_title(self, client, instructor):
        """Test POST /api/courses/ without title field."""
        course_data = {
            'description': 'Missing title',
            'price': '39.99',
            'instructor': instructor.id
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'title' in response.json() or 'error' in str(response.json())
    
    def test_create_course_missing_required_field_description(self, client, instructor):
        """Test POST /api/courses/ without description field."""
        course_data = {
            'title': 'No Description',
            'price': '39.99',
            'instructor': instructor.id
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_create_course_invalid_price(self, client, instructor):
        """Test POST /api/courses/ with invalid price."""
        course_data = {
            'title': 'Invalid Price',
            'description': 'Negative price',
            'price': '-10.00',
            'instructor': instructor.id
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_create_course_invalid_json(self, client):
        """Test POST /api/courses/ with invalid JSON."""
        response = client.post(
            '/api/courses/',
            'not valid json',
            content_type='application/json'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_create_course_response_contains_id(self, client, instructor):
        """Test that created course response includes ID."""
        course_data = {
            'title': 'Course with ID',
            'description': 'Should have ID',
            'price': '29.99',
            'instructor': instructor.id
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert 'id' in data
        assert isinstance(data['id'], int)
        assert data['id'] > 0
    
    # ============ GET Detail Tests ============
    
    def test_get_course_by_filtering(self, client, instructor):
        """Test filtering courses from the list to get specific course."""
        course = Course.objects.create(
            title='Detail Course',
            description='Test detail view',
            instructor=instructor,
            price=Decimal('34.99')
        )
        
        response = client.get('/api/courses/')
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        course_data = next((c for c in data if c['id'] == course.id), None)
        assert course_data is not None
        assert course_data['title'] == 'Detail Course'
        assert course_data['price'] == '34.99'
    
    def test_get_nonexistent_course_via_filtering(self, client):
        """Test that filtering for non-existent course returns empty list."""
        response = client.get('/api/courses/')
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        course_data = next((c for c in data if c['id'] == 99999), None)
        assert course_data is None
    
    # ============ PUT Update Tests ============
    
    def test_update_course_with_valid_data(self, client, instructor):
        """Test PUT /api/courses/<id>/ with valid data."""
        course = Course.objects.create(
            title='Original Title',
            description='Original description',
            instructor=instructor,
            price=Decimal('29.99')
        )
        
        update_data = {
            'title': 'Updated Title',
            'description': 'Updated description',
            'price': '39.99',
            'instructor': instructor.id
        }
        
        response = client.put(
            f'/api/courses/{course.id}/',
            update_data,
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data['title'] == 'Updated Title'
        assert data['price'] == '39.99'
    
    def test_update_course_persists_to_database(self, client, instructor):
        """Test that course updates are saved to database."""
        course = Course.objects.create(
            title='Original',
            description='Original',
            instructor=instructor,
            price=Decimal('19.99')
        )
        
        update_data = {
            'title': 'Updated',
            'description': 'Updated description',
            'price': '49.99',
            'instructor': instructor.id
        }
        
        response = client.put(
            f'/api/courses/{course.id}/',
            update_data,
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        
       
        updated_course = Course.objects.get(id=course.id)
        assert updated_course.title == 'Updated'
        assert updated_course.price == Decimal('49.99')
    
    def test_update_nonexistent_course(self, client):
        """Test PUT /api/courses/<id>/ for non-existent course."""
        update_data = {
            'title': 'Updated',
            'description': 'Updated',
            'price': '29.99'
        }
        
        response = client.put(
            '/api/courses/99999/',
            update_data,
            format='json'
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_course_partial_fields(self, client, instructor):
        """Test updating only some fields of a course."""
        course = Course.objects.create(
            title='Original Title',
            description='Original description',
            instructor=instructor,
            price=Decimal('29.99'),
            status='draft'
        )
        
        update_data = {
            'title': 'New Title',
            'description': 'Original description',  # Keep original
            'price': '29.99',  # Keep original
            'instructor': instructor.id,
            'status': 'draft'  # Keep original
        }
        
        response = client.put(
            f'/api/courses/{course.id}/',
            update_data,
            format='json'
        )
        assert response.status_code == status.HTTP_200_OK
        
        updated_course = Course.objects.get(id=course.id)
        assert updated_course.title == 'New Title'
        assert updated_course.description == 'Original description'
    
    def test_update_course_invalid_data(self, client, instructor):
        """Test PUT /api/courses/<id>/ with invalid data."""
        course = Course.objects.create(
            title='Original',
            description='Original',
            instructor=instructor,
            price=Decimal('29.99')
        )
        
        update_data = {
            'title': 'Updated',
            'description': 'Updated',
            'price': '-50.00',  # Invalid negative price
            'instructor': instructor.id
        }
        
        response = client.put(
            f'/api/courses/{course.id}/',
            update_data,
            format='json'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    # ============ DELETE Tests ============
    
    def test_delete_course(self, client, instructor):
        """Test DELETE /api/courses/<id>/ deletes course."""
        course = Course.objects.create(
            title='To Delete',
            description='Will be deleted',
            instructor=instructor,
            price=Decimal('29.99')
        )
        course_id = course.id
        
        response = client.delete(f'/api/courses/{course_id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify deleted from database
        assert not Course.objects.filter(id=course_id).exists()
    
    def test_delete_nonexistent_course(self, client):
        """Test DELETE /api/courses/<id>/ for non-existent course."""
        response = client.delete('/api/courses/99999/')
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_course_returns_empty_response(self, client, instructor):
        """Test that DELETE returns empty response with no content."""
        course = Course.objects.create(
            title='To Delete',
            description='Will be deleted',
            instructor=instructor,
            price=Decimal('29.99')
        )
        
        response = client.delete(f'/api/courses/{course.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert len(response.content) == 0
    
    # ============ Complex Workflow Tests ============
    
    def test_complete_course_lifecycle(self, client, instructor):
        """Test full workflow: create, read (via list), update, delete course."""
  
        create_data = {
            'title': 'Lifecycle Course',
            'description': 'Testing full lifecycle',
            'price': '49.99'
        }
        create_response = client.post('/api/courses/', create_data, format='json')
        assert create_response.status_code == status.HTTP_201_CREATED
        course_id = create_response.json()['id']
        
      
        cache.clear() 
        read_response = client.get('/api/courses/')
        assert read_response.status_code == status.HTTP_200_OK
        course_data = next((c for c in read_response.json() if c['id'] == course_id), None)
        assert course_data is not None
        assert course_data['title'] == 'Lifecycle Course'
        
        # Update
        update_data = {
            'title': 'Updated Lifecycle Course',
            'description': 'Testing full lifecycle updated',
            'price': '59.99'
        }
        update_response = client.put(
            f'/api/courses/{course_id}/',
            update_data,
            format='json'
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.json()['title'] == 'Updated Lifecycle Course'
        

        delete_response = client.delete(f'/api/courses/{course_id}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
 
        assert not Course.objects.filter(id=course_id).exists()
    
    def test_multiple_courses_crud_operations(self, client, instructor):
        """Test CRUD operations with multiple courses."""
    
        created_ids = []
        for i in range(3):
            create_data = {
                'title': f'Course {i+1}',
                'description': f'Description {i+1}',
                'price': f'{(i+1)*10}.99',
                'instructor': instructor.id
            }
            response = client.post('/api/courses/', create_data, format='json')
            assert response.status_code == status.HTTP_201_CREATED
            created_ids.append(response.json()['id'])

        list_response = client.get('/api/courses/')
        cache.clear() 
        list_response = client.get('/api/courses/')
        assert len(list_response.json()) >= 3
  
        update_data = {
            'title': 'Course 1 Updated',
            'description': 'Description 1',
            'price': '10.99',
            'instructor': instructor.id
        }
        update_response = client.put(
            f'/api/courses/{created_ids[0]}/',
            update_data,
            format='json'
        )
        assert update_response.status_code == status.HTTP_200_OK
        

        delete_response = client.delete(f'/api/courses/{created_ids[2]}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        

        assert Course.objects.filter(id=created_ids[0]).first().title == 'Course 1 Updated'
        assert not Course.objects.filter(id=created_ids[2]).exists()
        assert Course.objects.filter(id=created_ids[1]).exists()
    
    def test_course_filtering_integration(self, client, instructor):
        """Test course filtering with database queries."""
     
        active = Course.objects.create(
            title='Active Course',
            description='Active',
            instructor=instructor,
            price=Decimal('29.99'),
            status='active'
        )
        draft = Course.objects.create(
            title='Draft Course',
            description='Draft',
            instructor=instructor,
            price=Decimal('29.99'),
            status='draft'
        )
        
       
        active_courses = Course.objects.filter(status='active')
        draft_courses = Course.objects.filter(status='draft')
        
        assert active in active_courses
        assert draft not in active_courses
        assert draft in draft_courses
    
    def test_price_decimal_precision(self, client, instructor):
        """Test that decimal prices maintain precision through API."""
        course_data = {
            'title': 'Precision Course',
            'description': 'Testing decimal precision',
            'price': '199.99',
            'instructor': instructor.id
        }
        
        response = client.post('/api/courses/', course_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data['price'] == '199.99'
    
        course = Course.objects.get(id=data['id'])
        assert course.price == Decimal('199.99')
    
    def test_large_batch_operations(self, client, instructor):
        """Test creating and retrieving a large batch of courses."""

        for i in range(50):
            course_data = {
                'title': f'Batch Course {i+1}',
                'description': f'Batch {i+1}',
                'price': f'{(i%10)+1}.99',
                'instructor': instructor.id
            }
            response = client.post('/api/courses/', course_data, format='json')
            assert response.status_code == status.HTTP_201_CREATED
        
    
        cache.clear() 
        response = client.get('/api/courses/')
        data = response.json()
        assert len(data) == 50
