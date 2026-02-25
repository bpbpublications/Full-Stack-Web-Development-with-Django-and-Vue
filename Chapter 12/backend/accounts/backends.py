import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger('auth')

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        email = username 
        
        
        lockout_key = f'login_attempts_{email}'
        attempts = cache.get(lockout_key, 0)
        
        if attempts >= settings.MAX_LOGIN_ATTEMPTS:
            logger.warning(f'Account locked due to multiple failed attempts: {email}')
            return None
            
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
   
                cache.delete(lockout_key)
                logger.info(f'Successful login: {email}')
                return user
            else:
               
                attempts += 1
                cache.set(lockout_key, attempts, settings.LOCKOUT_TIME)
                logger.warning(f'Failed login attempt {attempts} for user: {email}')
                return None
        except User.DoesNotExist:
            logger.warning(f'Login attempt for non-existent user: {email}')
            return None

    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def user_can_authenticate(self, user):
        """
        Reject users with is_active=False.
        """
        return user is not None and user.is_active
