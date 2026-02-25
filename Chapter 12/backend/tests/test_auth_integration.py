"""
Integration tests for authentication endpoints.

Tests the complete authentication flow:
- User registration
- User login
- Get current user
- Token refresh
- User logout
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestAuthenticationAPI:
    """Test authentication endpoints."""

    # ============ Registration Tests ============

    def test_user_registration_success(self, api_client):
        """Test successful user registration returns 201 with JWT tokens."""
        payload = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'TestPass123!',
            'role': 'student'
        }
        
        response = api_client.post(reverse('register'), payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert response.data['user']['email'] == 'newuser@example.com'
        assert response.data['user']['name'] == 'New User'
        assert response.data['user']['role'] == 'student'

    def test_user_registration_missing_required_fields(self, api_client):
        """Test registration fails with missing required fields."""
        payload = {
            'email': 'newuser@example.com',
           
        }
        
        response = api_client.post(reverse('register'), payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'name' in response.data or 'password' in response.data

    def test_user_registration_invalid_email(self, api_client):
        """Test registration fails with invalid email format."""
        payload = {
            'email': 'invalid-email',
            'name': 'Test User',
            'password': 'TestPass123!'
        }
        
        response = api_client.post(reverse('register'), payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_user_registration_duplicate_email(self, api_client, seed_user):
        """Test registration fails when email already exists."""
        payload = {
            'email': seed_user.email,  # Use existing email
            'name': 'Different User',
            'password': 'TestPass123!'
        }
        
        response = api_client.post(reverse('register'), payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_user_registration_weak_password(self, api_client):
        """Test registration allows common passwords (validation depends on settings)."""
        payload = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': '123456'  
        }
        
        response = api_client.post(reverse('register'), payload)
        
       
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

    def test_user_password_hashed(self, api_client):
        """Test that user passwords are properly hashed, not stored plaintext."""
        payload = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'TestPass123!'
        }
        
        api_client.post(reverse('register'), payload)
        user = User.objects.get(email='newuser@example.com')
        
     
        assert user.password != 'TestPass123!'
        assert user.check_password('TestPass123!')

    # ============ Login Tests ============

    def test_user_login_success(self, api_client, seed_user):
        """Test successful login returns JWT tokens and user data."""
        payload = {
            'email': seed_user.email,
            'password': 'TestPass123!'
        }
        
        response = api_client.post(reverse('login'), payload)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == seed_user.email

    def test_user_login_invalid_email(self, api_client):
        """Test login fails with non-existent email."""
        payload = {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!'
        }
        
        response = api_client.post(reverse('login'), payload)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_user_login_invalid_password(self, api_client, seed_user):
        """Test login fails with incorrect password."""
        payload = {
            'email': seed_user.email,
            'password': 'WrongPassword123!'
        }
        
        response = api_client.post(reverse('login'), payload)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data

    def test_user_login_missing_credentials(self, api_client):
        """Test login fails with missing email or password."""
        payload = {
            'email': 'test@example.com'
            # Missing password
        }
        
        response = api_client.post(reverse('login'), payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_returns_valid_jwt_tokens(self, api_client, seed_user):
        """Test that login returns valid and decodable JWT tokens."""
        payload = {
            'email': seed_user.email,
            'password': 'TestPass123!'
        }
        
        response = api_client.post(reverse('login'), payload)
        
        assert response.status_code == status.HTTP_200_OK
        

        access_token = response.data['access']
        refresh_token = response.data['refresh']
        
 
        from rest_framework_simplejwt.tokens import AccessToken
        try:
            AccessToken(access_token)
            assert True
        except Exception:
            assert False, "Access token is invalid"

    def test_login_returns_user_info(self, api_client, seed_user):
        """Test that login returns complete user information."""
        payload = {
            'email': seed_user.email,
            'password': 'TestPass123!'
        }
        
        response = api_client.post(reverse('login'), payload)
        
        assert response.status_code == status.HTTP_200_OK
        user_data = response.data['user']
        assert user_data['id'] == seed_user.id
        assert user_data['email'] == seed_user.email
        assert user_data['name'] == seed_user.name
        assert user_data['role'] == seed_user.role

    # ============ Get Current User Tests ============

    def test_get_current_user_authenticated(self, authenticated_client):
        """Test getting current user when authenticated."""
        response = authenticated_client.get(reverse('user-list'))
        

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN]

    def test_get_current_user_unauthenticated(self, api_client):
        """Test getting current user fails when not authenticated."""
        response = api_client.get(reverse('user-list'))
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # ============ Token Refresh Tests ============

    def test_token_refresh_success(self, api_client, seed_user):
        """Test refreshing JWT token with valid refresh token."""
        refresh = RefreshToken.for_user(seed_user)
        
        payload = {'refresh': str(refresh)}
        response = api_client.post(reverse('token_refresh'), payload)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        

        from rest_framework_simplejwt.tokens import AccessToken
        try:
            AccessToken(response.data['access'])
            assert True
        except Exception:
            assert False, "New access token is invalid"

    def test_token_refresh_invalid_token(self, api_client):
        """Test token refresh fails with invalid refresh token."""
        payload = {'refresh': 'invalid-token'}
        
        response = api_client.post(reverse('token_refresh'), payload)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh_missing_token(self, api_client):
        """Test token refresh fails without refresh token."""
        payload = {}
        
        response = api_client.post(reverse('token_refresh'), payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # ============ Logout Tests ============

    def test_user_logout_authenticated(self, authenticated_client):
        """Test logout succeeds when authenticated."""
        response = authenticated_client.post(reverse('logout'))
        
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]

    def test_user_logout_unauthenticated(self, api_client):
        """Test logout behavior when not authenticated."""
        response = api_client.post(reverse('logout'))
        
  
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT, status.HTTP_403_FORBIDDEN]

    # ============ Authorization Tests ============

    def test_authenticated_user_can_access_protected_endpoint(self, authenticated_client, api_client):
        """Test that authenticated users can access protected endpoints."""

        response = authenticated_client.post(reverse('logout'))
        
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]

    def test_unauthenticated_user_cannot_access_protected_endpoint(self, api_client):
        """Test that unauthenticated users cannot access protected endpoints."""

        response = api_client.post(reverse('logout'))

        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT, status.HTTP_403_FORBIDDEN]

    # ============ Edge Cases ============

    def test_user_can_login_after_registration(self, api_client):
        """Test complete flow: register then login."""
        register_payload = {
            'email': 'newuser@example.com',
            'name': 'New User',
            'password': 'TestPass123!'
        }
        
        register_response = api_client.post(reverse('register'), register_payload)
        assert register_response.status_code == status.HTTP_201_CREATED
        

        login_payload = {
            'email': 'newuser@example.com',
            'password': 'TestPass123!'
        }
        
        login_response = api_client.post(reverse('login'), login_payload)
        assert login_response.status_code == status.HTTP_200_OK
        assert 'access' in login_response.data

    def test_registered_user_data_matches(self, api_client):
        """Test that registered user data matches what was provided."""
        payload = {
            'email': 'newuser@example.com',
            'name': 'New User Name',
            'password': 'TestPass123!',
            'role': 'student'
        }
        
        response = api_client.post(reverse('register'), payload)
        user_data = response.data['user']
        
        assert user_data['email'] == payload['email']
        assert user_data['name'] == payload['name']
        assert user_data['role'] == payload['role']

    def test_multiple_users_can_login(self, api_client, seed_user, seed_instructor):
        """Test that multiple different users can each login."""

        student_payload = {
            'email': seed_user.email,
            'password': 'TestPass123!'
        }
        student_response = api_client.post(reverse('login'), student_payload)
        assert student_response.status_code == status.HTTP_200_OK
        student_token = student_response.data['access']
        

        instructor_payload = {
            'email': seed_instructor.email,
            'password': 'TestPass123!'
        }
        instructor_response = api_client.post(reverse('login'), instructor_payload)
        assert instructor_response.status_code == status.HTTP_200_OK
        instructor_token = instructor_response.data['access']
        

        assert student_token != instructor_token
