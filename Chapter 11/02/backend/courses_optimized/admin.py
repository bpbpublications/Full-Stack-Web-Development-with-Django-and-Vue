from django.contrib import admin
from .models import OptimizedCourse, CourseStats


@admin.register(OptimizedCourse)
class OptimizedCourseAdmin(admin.ModelAdmin):
    """Admin interface for OptimizedCourse model."""
    list_display = ('title', 'instructor', 'price', 'rating', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'rating')
    search_fields = ('title', 'description', 'instructor__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Course Information', {
            'fields': ('title', 'description', 'instructor')
        }),
        ('Details', {
            'fields': ('price', 'rating', 'status', 'thumbnail')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseStats)
class CourseStatsAdmin(admin.ModelAdmin):
    """Admin interface for CourseStats model."""
    list_display = ('course_title', 'enrolled_count', 'completed_count', 'avg_rating')
    readonly_fields = ('course', 'enrolled_count', 'completed_count', 'avg_rating', 'updated_at')
    
    def course_title(self, obj):
        return obj.course.title
    course_title.short_description = 'Course'
    
    def has_add_permission(self, request):
        """Stats are auto-generated, not manually created."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent manual deletion of stats."""
        return False
