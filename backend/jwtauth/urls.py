from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from jwtauth.views import RegistrationView, PasswordResetView, EmailVerificationCreateView, AccountActivationView

urlpatterns = [
    path(r'token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path(r'token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path(r'token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path(r'register/', RegistrationView.as_view(), name='user_registration'),
    path(r'password-reset/', PasswordResetView.as_view(), name='password_change'),
    path(r'email-verify/', EmailVerificationCreateView.as_view(), name='email_verify'),
    path(r'account-activate/', AccountActivationView.as_view(), name='account_activate'),
]