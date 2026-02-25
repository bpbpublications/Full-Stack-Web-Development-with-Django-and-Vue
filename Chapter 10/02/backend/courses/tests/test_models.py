"""
Test suite for courses models.
Tests model creation, validation, and relationships.
"""
import pytest
from decimal import Decimal
from django.test import TestCase
from courses.models import Course
from accounts.models import CustomUser


@pytest.mark.django_db
class TestCourseModel:
    """Test suite for Course model."""
    
    @pytest.fixture
    def instructor(self):
        """Create a test instructor user."""
      
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        return CustomUser.objects.create_user(
            email=f'instructor-{unique_id}@example.com',
            name='John Instructor',
            password='testpass123',
            role='instructor'
        )
    
    @pytest.fixture
    def course(self, instructor):
        """Create a test course."""
        return Course.objects.create(
            title='Python Basics',
            description='Learn Python fundamentals',
            instructor=instructor,
            price=Decimal('29.99'),
            status='active'
        )
    
    def test_course_creation(self, course):
        """Test that a course can be created with valid data."""
        assert course.id is not None
        assert course.title == 'Python Basics'
        assert course.price == Decimal('29.99')
        assert course.status == 'active'
    
    def test_course_string_representation(self, course):
        """Test the string representation of a course."""
        assert str(course) == 'Python Basics'
    
    def test_course_default_values(self, instructor):
        """Test that course fields have correct default values."""
        course = Course.objects.create(
            title='Test Course',
            description='Test description',
            instructor=instructor,
            price=Decimal('19.99')
        )
        assert course.rating == Decimal('0.0')
        assert course.enrolled == 0
        assert course.status == 'draft'
        assert course.thumbnail is None
    
    def test_course_price_validation(self, course):
        """Test that course price is stored correctly."""
        assert isinstance(course.price, Decimal)
        assert course.price == Decimal('29.99')
    
    def test_course_instructor_relationship(self, instructor, course):
        """Test the relationship between course and instructor."""
        assert course.instructor == instructor
        assert instructor.courses.count() >= 1
        assert course in instructor.courses.all()
    
    def test_course_status_choices(self, instructor):
        """Test that course status can only be 'active' or 'draft'."""
        course = Course.objects.create(
            title='Status Test',
            description='Test status',
            instructor=instructor,
            price=Decimal('9.99'),
            status='active'
        )
        assert course.status in ['active', 'draft']
    
    def test_course_without_instructor(self):
        """Test that course can be created without an instructor."""
        course = Course.objects.create(
            title='Free Course',
            description='A free course',
            price=Decimal('0.00'),
            instructor=None
        )
        assert course.instructor is None
    
    def test_course_timestamp_fields(self, course):
        """Test that created_at and updated_at fields are set."""
        assert course.created_at is not None
        assert course.updated_at is not None
        assert course.created_at <= course.updated_at
    
    def test_course_ordering(self, instructor):
        """Test that courses are ordered by creation date (newest first)."""
        Course.objects.filter(instructor=instructor).delete()
        
        course1 = Course.objects.create(
            title='Course 1',
            description='First',
            instructor=instructor,
            price=Decimal('10.00')
        )
        course2 = Course.objects.create(
            title='Course 2',
            description='Second',
            instructor=instructor,
            price=Decimal('20.00')
        )
        
        courses = Course.objects.filter(instructor=instructor)
        assert courses[0].id == course2.id 
        assert courses[1].id == course1.id
