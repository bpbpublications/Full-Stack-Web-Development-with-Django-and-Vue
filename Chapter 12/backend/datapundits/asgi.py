

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "datapundits.settings")

from django.core.asgi import get_asgi_application

# Initialize Django ASGI application first
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from accounts.middleware import TokenAuthMiddleware
from . import routing

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            TokenAuthMiddleware(
                AuthMiddlewareStack(
                    URLRouter(routing.websocket_urlpatterns)
                )
            )
        ),
    }
)
