from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'avatar', 'bio', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.STUDENT)
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'phone', 'address', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['user']
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate_new_password(self, value):
        # Add any password validation rules here
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if value.isdigit():
            raise serializers.ValidationError("Password cannot be entirely numeric")
        return value

    def validate(self, data):
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password"
            })
        return data
