"""
Optimized Course Models with Performance Considerations
"""
from django.db import models
from django.db.models import F, Count, Avg, Prefetch
from django.utils.text import slugify
from accounts.models import CustomUser


class OptimizedCourseQuerySet(models.QuerySet):
    """Custom QuerySet with optimization methods to avoid N+1 queries."""
    
    def with_instructor(self):
     
        return self.select_related('instructor')
    
    def with_stats(self):
   
        return self.prefetch_related('stats')
    
    def active_only(self):
    
        return self.filter(status='active')
    
    def optimized(self):
    
        return self.with_instructor().with_stats()
    
    def with_annotation(self):
        """Add annotation for enrollment counts efficiently."""
        from enrollments.models import Enrollment
        from django.contrib.contenttypes.models import ContentType
        
        content_type = ContentType.objects.get_for_model(OptimizedCourse)
        return self.annotate(
            total_enrollments=Count(
                'enrollments',
                distinct=True
            )
        )


class OptimizedCourseManager(models.Manager):
    """Custom manager with optimization methods."""
    
    def get_queryset(self):
        return OptimizedCourseQuerySet(self.model, using=self._db)
    
    def active(self):

        return self.get_queryset().active_only()
    
    def optimized(self):

        return self.get_queryset().optimized()


class OptimizedCourse(models.Model):
    """
    Optimized Course Model with Performance Considerations
    
    Key optimizations:
    - Denormalized rating and enrolled count (stored in CourseStats)
    - Indexed fields for common queries
    - Related name for reverse queries
    - Slug field for URL optimization
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('draft', 'Draft'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField()
    instructor = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='optimized_courses',
        db_index=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    

    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0, db_index=True)
    enrolled = models.IntegerField(default=0, db_index=True)
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        db_index=True
    )
    thumbnail = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = OptimizedCourseManager()
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Optimized Course"
        verbose_name_plural = "Optimized Courses"
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['rating', '-enrolled']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Auto-generate slug on save."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    @classmethod
    def bulk_create_optimized(cls, courses_data, batch_size=1000):
        """
        Create multiple courses efficiently.
        
        Args:
            courses_data: List of dicts with course information
            batch_size: Number of objects to create per batch
        
        Returns:
            List of created OptimizedCourse instances
        """
        courses = [
            cls(
                title=data['title'],
                slug=slugify(data['title']),
                description=data['description'],
                instructor_id=data['instructor_id'],
                price=data['price'],
                status=data.get('status', 'draft'),
                thumbnail=data.get('thumbnail', None)
            )
            for data in courses_data
        ]
        return cls.objects.bulk_create(courses, batch_size=batch_size)


class CourseStats(models.Model):
    """
    Denormalized Course Statistics Model
    
    Purpose: Cache aggregated data to avoid expensive queries
    This is a classic denormalization technique for performance optimization.
    
    Instead of:
        SELECT COUNT(*) FROM enrollments WHERE course_id = 1
        SELECT AVG(rating) FROM reviews WHERE course_id = 1
    
    We store these values here and update on enrollment/review changes.
    """
    
    course = models.OneToOneField(
        OptimizedCourse,
        on_delete=models.CASCADE,
        related_name='stats'
    )
    enrolled_count = models.IntegerField(default=0, db_index=True)
    completed_count = models.IntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    total_reviews = models.IntegerField(default=0)
    

    last_enrollment = models.DateTimeField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Course Stats"
        verbose_name_plural = "Course Stats"
        indexes = [
            models.Index(fields=['enrolled_count']),
            models.Index(fields=['avg_rating']),
        ]
    
    def __str__(self):
        return f"Stats for {self.course.title}"
    
    @classmethod
    def update_course_stats(cls, course_id):
        """
        Update denormalized stats for a course.
        Called after enrollment or review changes.
        
        This prevents N+1 queries by caching aggregates.
        """
        from enrollments.models import Enrollment
        from django.contrib.contenttypes.models import ContentType
        from django.db.models import Count, Q
        
        content_type = ContentType.objects.get_for_model(OptimizedCourse)
        
        stats_data = Enrollment.objects.filter(
            content_type=content_type,
            object_id=course_id
        ).aggregate(
            enrolled=Count('id'),
            completed=Count('id', filter=Q(status='completed'))
        )
        
        stats, created = cls.objects.get_or_create(course_id=course_id)
        stats.enrolled_count = stats_data['enrolled']
        stats.completed_count = stats_data['completed']
        stats.save(update_fields=['enrolled_count', 'completed_count', 'updated_at'])
    
    @classmethod
    def batch_update_stats(cls, course_ids):
        """Update stats for multiple courses efficiently."""
        for course_id in course_ids:
            cls.update_course_stats(course_id)
