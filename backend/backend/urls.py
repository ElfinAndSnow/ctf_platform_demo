"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls

from library.views import BookViewSet
from rest_framework import routers
# import jwtauth.urls as jwturls
from django.urls import path
from account import models
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Test description",
      # terms_of_service="https://www.google.com/policies/terms/",
      # contact=openapi.Contact(email="contact@snippets.local"),
      # license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[
       permissions.AllowAny,
   ],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # 接口文档，开放访问权限用于前端开发
    # 以后使用swagger
    # path(r'docs/', include_docs_urls(title="接口文档", authentication_classes=[], permission_classes=[])),
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path(r'api/', include('library.urls')),
    path(r'api/', include('article.urls')),
    path(r'api/', include('account.urls')),
    path(r'api/', include('leaderboard.urls')),

    # path(r'api/', include('puzzles.urls')),
    path(r'api/', include('challenge.urls')),

    # login, register, token
    path(r'auth/', include('jwtauth.urls')),

    # team
    path(r'api/', include('team.urls'))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns += router.urls
