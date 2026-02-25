"""
Optimized Serializers with Performance Considerations

"""
from rest_framework import serializers
from .models import OptimizedCourse, CourseStats


class CourseStatsSerializer(serializers.ModelSerializer):
    """Serializer for denormalized course statistics."""
    
    class Meta:
        model = CourseStats
        fields = ['enrolled_count', 'completed_count', 'avg_rating', 'total_reviews']
        read_only_fields = fields


class InstructorBasicSerializer(serializers.Serializer):
    """Lightweight instructor serializer to avoid deep nesting."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.CharField()


class OptimizedCourseSerializer(serializers.ModelSerializer):
    """
    Main Course Serializer with optimization considerations.
    

    """
    
    instructor = InstructorBasicSerializer(read_only=True)
    stats = CourseStatsSerializer(read_only=True)
    
    class Meta:
        model = OptimizedCourse
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'instructor',
            'price',
            'rating',
            'enrolled',
            'status',
            'thumbnail',
            'stats',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'rating', 'enrolled']
    
    def validate_price(self, value):
        """Validate that price is greater than zero."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        return value
    
    def validate_title(self, value):
        """Validate title is not empty and within limits."""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        if len(value) > 255:
            raise serializers.ValidationError("Title is too long (max 255 characters)")
        return value


class OptimizedCourseListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views (pagination).
    
    Reduces payload size and serialization time by excluding heavy fields.
    """
    
    instructor_name = serializers.CharField(source='instructor.name', read_only=True)
    enrolled_count = serializers.SerializerMethodField()
    
    class Meta:
        model = OptimizedCourse
        fields = [
            'id',
            'title',
            'slug',
            'price',
            'rating',
            'status',
            'instructor_name',
            'enrolled_count',
            'created_at'
        ]
    
    def get_enrolled_count(self, obj):
        """Get enrolled count from denormalized stats."""
        if hasattr(obj, 'stats'):
            return obj.stats.enrolled_count
        return 0


class OptimizedCourseDetailSerializer(serializers.ModelSerializer):
    """
    Detail serializer with complete information.
    Used when fetching single course with all related data.
    """
    
    instructor = InstructorBasicSerializer(read_only=True)
    stats = CourseStatsSerializer(read_only=True)
    enrollment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = OptimizedCourse
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'instructor',
            'price',
            'rating',
            'enrolled',
            'status',
            'thumbnail',
            'stats',
            'enrollment_url',
            'created_at',
            'updated_at'
        ]
    
    def get_enrollment_url(self, obj):
        """Get enrollment endpoint URL."""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/courses/{obj.id}/enroll/')
        return f'/api/courses/{obj.id}/enroll/'
