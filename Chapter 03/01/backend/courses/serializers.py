from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model.

    Validates and serializes Course objects with custom validation for price
    and title fields.
    """

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'price',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_price(self, value):
        """Validate that price is greater than zero.

        Args:
            value: The price value to validate.

        Returns:
            The validated price value.

        Raises:
            ValidationError: If price is less than or equal to zero.
        """
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        return value

    def validate_title(self, value):
        """Validate that title is not empty and doesn't exceed max length.

        Args:
            value: The title value to validate.

        Returns:
            The validated and stripped title value.

        Raises:
            ValidationError: If title is empty or exceeds 255 characters.
        """
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        if len(value) > 255:
            raise serializers.ValidationError("Title is too long")
        return value.strip()