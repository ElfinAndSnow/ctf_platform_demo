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
from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls

from library.views import BookViewSet
from rest_framework import routers
# import jwtauth.urls as jwturls
from django.urls import path


router = routers.DefaultRouter()

router.register("books", BookViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    # 接口文档，开放访问权限用于前端开发
    path(r'docs/', include_docs_urls(title="接口文档", authentication_classes=[], permission_classes=[])),

    path(r'api/', include(router.urls)),

    # login, register, token
    path(r'auth/', include('jwtauth.urls')),
]

# urlpatterns += router.urls
