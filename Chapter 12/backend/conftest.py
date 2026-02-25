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

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from tests.factories import (
    UserFactory,
    InstructorFactory,
    AdminUserFactory,
    CourseFactory,
    CourseInactivFactory,
    EnrollmentFactory,
    CompletedEnrollmentFactory
)

User = get_user_model()


try:
    from categories.models import Category
    CATEGORY_AVAILABLE = True
except ImportError:
    CATEGORY_AVAILABLE = False

# ============ API Client Fixtures ============

@pytest.fixture
def api_client(db):
    """Return unauthenticated API client"""
    return APIClient()

@pytest.fixture
def authenticated_client(db):
    """Return authenticated API client with a test user"""
    user = UserFactory(email="student@example.com", password="TestPass123!")
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    client.user = user
    return client

@pytest.fixture
def instructor_client(db):
    """Return authenticated API client with an instructor"""
    user = InstructorFactory(email="instructor@example.com", password="TestPass123!")
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    client.user = user
    return client

@pytest.fixture
def admin_client(db):
    """Return authenticated API client with admin user"""
    user = AdminUserFactory(email="admin@example.com", password="TestPass123!")
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    client.user = user
    return client

# ============ User Fixtures ============

@pytest.fixture
def seed_user(db):
    """Create a test student user"""
    user = UserFactory(
        email="student@example.com",
        name="Student User",
        role=User.Role.STUDENT,
        password="TestPass123!"
    )
    return user

@pytest.fixture
def seed_instructor(db):
    """Create a test instructor user"""
    user = InstructorFactory(
        email="instructor@example.com",
        name="Instructor User",
        password="TestPass123!"
    )
    return user

@pytest.fixture
def seed_admin(db):
    """Create a test admin user"""
    user = AdminUserFactory(
        email="admin@example.com",
        name="Admin User",
        password="TestPass123!"
    )
    return user

@pytest.fixture
def create_user(db):
    """Factory for creating users with custom parameters"""
    def _create_user(email=None, name=None, role=User.Role.STUDENT, password="TestPass123!", **kwargs):
        import uuid
        if not email:
            email = f"user-{str(uuid.uuid4())[:8]}@example.com"
        if not name:
            name = "Test User"
        
        user = User.objects.create_user(
            email=email,
            name=name,
            password=password,
            role=role,
            **kwargs
        )
        return user
    return _create_user

@pytest.fixture
def instructor(create_user):
    """Create an instructor user"""
    return create_user(role=User.Role.INSTRUCTOR, name="John Instructor", email="john@example.com")

@pytest.fixture
def student(create_user):
    """Create a student user"""
    return create_user(role=User.Role.STUDENT, name="Jane Student", email="jane@example.com")

@pytest.fixture
def admin_user(create_user):
    """Create an admin user"""
    return create_user(role=User.Role.ADMINISTRATOR, name="Admin User", email="admintest@example.com")

# ============ Course Fixtures ============

@pytest.fixture
def seed_course(db, seed_instructor):
    """Create a test course"""
    return CourseFactory(
        title="Python for Data Science",
        description="Learn Python from scratch",
        instructor=seed_instructor,
        price=250.00,
        status='active'
    )

@pytest.fixture
def seed_courses(db, seed_instructor):
    """Create multiple test courses"""
    return [
        CourseFactory(
            title="Python for Data Science",
            description="Learn Python programming",
            instructor=seed_instructor,
            price=250.00,
            status='active'
        ),
        CourseFactory(
            title="Machine Learning Fundamentals",
            description="Learn ML concepts and applications",
            instructor=seed_instructor,
            price=199.99,
            status='active'
        ),
        CourseFactory(
            title="Web Development with Django",
            description="Build web applications with Django",
            instructor=seed_instructor,
            price=299.99,
            status='active'
        ),
    ]

@pytest.fixture
def inactive_course(db, seed_instructor):
    """Create an inactive/draft course"""
    return CourseInactivFactory(
        title="Draft Course",
        instructor=seed_instructor,
        status='draft'
    )

# ============ Enrollment Fixtures ============

@pytest.fixture
def seed_enrollment(db, seed_user, seed_course):
    """Create a test enrollment"""
    from django.contrib.contenttypes.models import ContentType
    
    content_type = ContentType.objects.get_for_model(seed_course.__class__)
    enrollment = EnrollmentFactory(
        user=seed_user,
        content_type=content_type,
        object_id=seed_course.id,
        content_title=seed_course.title,
        status='active'
    )
    return enrollment

@pytest.fixture
def completed_enrollment(db, seed_user, seed_course):
    """Create a completed enrollment"""
    from django.contrib.contenttypes.models import ContentType
    
    content_type = ContentType.objects.get_for_model(seed_course.__class__)
    enrollment = CompletedEnrollmentFactory(
        user=seed_user,
        content_type=content_type,
        object_id=seed_course.id,
        content_title=seed_course.title
    )
    return enrollment