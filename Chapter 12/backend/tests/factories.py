"""
Data factory classes for creating test instances of models.
Uses factory_boy for clean, reusable test data generation.
"""
import factory
from django.contrib.auth import get_user_model
from courses.models import Course
from enrollments.models import Enrollment
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Factory for creating test users."""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    name = factory.Sequence(lambda n: f"Test User {n}")
    first_name = "Test"
    last_name = "User"
    role = User.Role.STUDENT
    is_active = True
    
    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        """Set password after user creation."""
        if not create:
            return
        password = extracted or 'TestPass123!'
        obj.set_password(password)
        obj.save()


class InstructorFactory(UserFactory):
    """Factory for creating instructor users."""
    role = User.Role.INSTRUCTOR


class AdminUserFactory(UserFactory):
    """Factory for creating admin users."""
    role = User.Role.ADMINISTRATOR
    is_staff = True
    is_superuser = True


class CourseFactory(factory.django.DjangoModelFactory):
    """Factory for creating test courses."""
    
    class Meta:
        model = Course
    
    title = factory.Sequence(lambda n: f"Test Course {n}")
    description = "This is a test course description"
    instructor = factory.SubFactory(InstructorFactory)
    price = 29.99
    rating = 0.0
    enrolled = 0
    status = 'active'
    thumbnail = None
    
    @factory.lazy_attribute
    def description(self):
        """Generate realistic description."""
        return f"Learn comprehensive skills in this course. Includes hands-on projects and real-world examples."


class CourseInactivFactory(CourseFactory):
    """Factory for creating inactive courses."""
    status = 'draft'
    enrolled = 0


class EnrollmentFactory(factory.django.DjangoModelFactory):
    """Factory for creating test enrollments."""
    
    class Meta:
        model = Enrollment
    
    user = factory.SubFactory(UserFactory)
    content_type = factory.LazyAttribute(
        lambda o: ContentType.objects.get_for_model(Course)
    )
    object_id = factory.LazyAttribute(lambda o: o.course.id if hasattr(o, 'course') else 1)
    content_title = "Test Course"
    status = 'active'
    progress_percentage = 0
    total_lessons = 10
    completed_lessons = 0
    time_spent_minutes = 0
    
    @factory.post_generation
    def course(obj, create, extracted, **kwargs):
        """Link to a course if provided."""
        if not create:
            return
        if extracted:
            obj.object_id = extracted.id
            obj.content_title = extracted.title
            obj.save()


class CompletedEnrollmentFactory(EnrollmentFactory):
    """Factory for creating completed enrollments."""
    status = 'completed'
    progress_percentage = 100
    total_lessons = 10
    completed_lessons = 10
    time_spent_minutes = 300
