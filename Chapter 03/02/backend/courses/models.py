from django.db import models
from django.utils.text import slugify
from accounts.models import CustomUser


class Course(models.Model):
    """Model representing a course.

    Attributes:
        title: The name of the course (max 255 characters).
        description: Detailed description of the course content.
        price: The cost of the course (decimal with 2 decimal places).
        created_at: Timestamp when the course was created (auto-set).
        updated_at: Timestamp when the course was last updated (auto-updated).
    """

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Course"
        verbose_name_plural = "Courses"

    def __str__(self):
        """Return the string representation of the course.

        Returns:
            str: The title of the course.
        """
        return self.title