import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

@pytest.fixture
def user_model():
    return get_user_model()

@pytest.fixture
def user_data():
    return {
        'email': 'test@example.com',
        'password': 'TestPass123!',
        'first_name': 'Test',
        'last_name': 'User'
    }

@pytest.fixture
def created_user(user_model, user_data, django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        user = user_model.objects.create_user(**user_data)
        return user

@pytest.fixture
def authenticated_client(api_client, created_user, user_data):
    api_client.post(reverse('login'), {
        'email': user_data['email'],
        'password': user_data['password']
    })
    return api_client

@pytest.mark.django_db
class TestAuthentication:
    def test_login_success(self, api_client, created_user, user_data):
        response = api_client.post(reverse('login'), {
            'email': user_data['email'],
            'password': user_data['password']
        })
        assert response.status_code == status.HTTP_200_OK

    def test_login_wrong_password(self, api_client, created_user, user_data):
        response = api_client.post(reverse('login'), {
            'email': user_data['email'],
            'password': 'wrongpassword'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_account_lockout(self, api_client, created_user, user_data):
        for _ in range(5):
            api_client.post(reverse('login'), {
                'email': user_data['email'],
                'password': 'wrongpassword'
            })
        response = api_client.post(reverse('login'), {
            'email': user_data['email'],
            'password': user_data['password']
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout(self, authenticated_client):
        response = authenticated_client.post(reverse('logout'))
        assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
class TestPasswordReset:
    def test_password_reset_request(self, api_client, created_user):
        response = api_client.post(reverse('password_reset'), {
            'email': created_user.email
        })
        assert response.status_code == status.HTTP_200_OK
        assert len(mail.outbox) == 1

    def test_password_reset_confirm(self, api_client, created_user):
       
        pass

@pytest.mark.django_db
class TestTokenAuthentication:
    def test_obtain_token_pair(self, api_client, created_user, user_data):
        response = api_client.post(reverse('token_obtain_pair'), {
            'email': user_data['email'],
            'password': user_data['password']
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_refresh_token(self, api_client, created_user, user_data):
       
        response = api_client.post(reverse('token_obtain_pair'), {
            'email': user_data['email'],
            'password': user_data['password']
        })
        refresh_token = response.data['refresh']

     
        response = api_client.post(reverse('token_refresh'), {
            'refresh': refresh_token
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_verify_token(self, api_client, created_user, user_data):
       
        response = api_client.post(reverse('token_obtain_pair'), {
            'email': user_data['email'],
            'password': user_data['password']
        })
        access_token = response.data['access']

        response = api_client.post(reverse('token_verify'), {
            'token': access_token
        })
        assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
class TestAuthenticationIntegration:
    def test_protected_endpoint_access(self, authenticated_client):
        response = authenticated_client.get(reverse('protected-endpoint'))
        assert response.status_code == status.HTTP_200_OK
