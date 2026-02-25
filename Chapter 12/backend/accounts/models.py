from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'administrator')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', _('Student')
        INSTRUCTOR = 'instructor', _('Instructor')
        ADMINISTRATOR = 'administrator', _('Administrator')

    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text=('The groups this user belongs to. A user will get all permissions '
                   'granted to each of their groups.'),
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_instructor(self):
        return self.role == self.Role.INSTRUCTOR

    @property
    def is_administrator(self):
        return self.role == self.Role.ADMINISTRATOR

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s profile"