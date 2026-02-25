from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from urllib.parse import parse_qs
from asgiref.sync import sync_to_async

from rest_framework_simplejwt.authentication import JWTAuthentication


@sync_to_async
def get_user_from_token(raw_token: str):
    jwt_auth = JWTAuthentication()
    validated_token = jwt_auth.get_validated_token(raw_token)
    return jwt_auth.get_user(validated_token)


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()

        query_params = parse_qs(scope.get("query_string", b"").decode("utf-8"))
        token_list = query_params.get("token", [])
        token = token_list[0] if token_list else None

        if token:
            if token.lower().startswith("bearer "):
                token = token[7:]

            try:
                scope["user"] = await get_user_from_token(token)
            except Exception:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
