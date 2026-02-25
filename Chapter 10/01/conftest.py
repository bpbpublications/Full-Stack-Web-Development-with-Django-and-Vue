"""
Pytest configuration file for Django testing.
This file is automatically loaded by pytest and sets up Django test fixtures.
"""
import os
import django
import pytest
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'datapundits.settings')
django.setup()

from accounts.models import CustomUser
from courses.models import Course


try:
    from categories.models import Category
    CATEGORY_AVAILABLE = True
except ImportError:
    CATEGORY_AVAILABLE = False

# ============ User Fixtures ============

@pytest.fixture
def create_user(db):
    """Factory for creating users with custom parameters"""
    def _create_user(email=None, name=None, role="student", **kwargs):
        import uuid
        if not email:
            email = f"user-{str(uuid.uuid4())[:8]}@example.com"
        if not name:
            name = "Test User"
        
        return CustomUser.objects.create_user(
            email=email,
            name=name,
            password="testpass123",
            role=role,
            **kwargs
        )
    return _create_user

@pytest.fixture
def instructor(create_user):
    """Create an instructor user"""
    return create_user(role="instructor", name="John Instructor")

@pytest.fixture
def student(create_user):
    """Create a student user"""
    return create_user(role="student", name="Jane Student")

@pytest.fixture
def admin_user(create_user):
    """Create an admin user"""
    return create_user(role="administrator", name="Admin User")

# ============ Category Fixtures ============

if CATEGORY_AVAILABLE:
    @pytest.fixture
    def create_category(db):
        """Factory for creating categories"""
        def _create_category(name="Programming", **kwargs):
            return Category.objects.create(name=name, **kwargs)
        return _create_category

    @pytest.fixture
    def category(create_category):
        """Default programming category"""
        return create_category(name="Programming")
else:
    @pytest.fixture
    def create_category(db):
        """Category fixture (not available - app not installed)"""
        pytest.skip("Categories app not installed")
    
    @pytest.fixture
    def category(db):
        """Category fixture (not available - app not installed)"""
        pytest.skip("Categories app not installed")

# ============ Course Fixtures ============

@pytest.fixture
def create_course(db):
    """Factory for creating courses"""
    def _create_course(
        title="Test Course",
        description="Test description",
        category=None,
        instructor=None,
        price=99.99,
        duration=10,
        **kwargs
    ):
        if not instructor:
            instructor = CustomUser.objects.filter(role="instructor").first()
        
        course_data = {
            'title': title,
            'description': description,
            'instructor': instructor,
            'price': price,
            'duration': duration,
            **kwargs
        }
        

        if CATEGORY_AVAILABLE and category:
            course_data['category'] = category
        
        return Course.objects.create(**course_data)
    return _create_course

@pytest.fixture
def sample_course(create_course, instructor):
    """Sample Python course"""
    kwargs = {
        'title': 'Python for Data Science',
        'description': 'Learn Python from scratch',
        'instructor': instructor,
        'price': 250.00,
        'duration': 15,
    }
    

    if CATEGORY_AVAILABLE:
        try:
            category_obj = Category.objects.get(name="Programming")
        except Category.DoesNotExist:
            category_obj = Category.objects.create(name="Programming")
        kwargs['category'] = category_obj
    
    return create_course(**kwargs)