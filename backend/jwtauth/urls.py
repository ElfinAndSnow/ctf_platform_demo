from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from jwtauth.views import RegistrationView, PasswordUpdateView

urlpatterns = [
    path(r'token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path(r'token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path(r'token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path(r'register/', RegistrationView.as_view(), name='user_registration'),
    path(r'password/change/<int:pk>/', PasswordUpdateView.as_view(), name='password_change')
]