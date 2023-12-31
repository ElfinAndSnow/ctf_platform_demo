from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from account.models import User
from jwtauth.models import EmailVerification
from jwtauth.serializer import RegistrationSerializer, PasswordResetSerializer, CodeVerificationSerializer, \
    EmailVerificationCreateSerializer
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from account.models import User
from utils.custom_permissions import IsSelf, IsAdminOrSessionCreator, IsActivatedUser
from utils.custom_throttles import AuthAnonThrottle
from utils.email_verification import email_verification

from django.core.mail import send_mail, send_mass_mail


class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny, ]
    throttle_classes = [AuthAnonThrottle]


class PasswordResetView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = PasswordResetSerializer
    permission_classes = [IsAuthenticated, IsSelf]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(instance=request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            {"detail": "You have successfully reset your password."},
            status=status.HTTP_200_OK,
            headers=headers
        )


class EmailVerificationCreateView(generics.CreateAPIView):
    queryset = EmailVerification
    permission_classes = [IsAuthenticated, IsAdminOrSessionCreator]
    serializer_class = EmailVerificationCreateSerializer

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        data = {
            'username': request.user.username,
            'email': request.user.email,
        }
        purpose = request.data['purpose']
        email_verification(instance=instance)

        return Response(
            {"detail": "An email including a verify code has been sent to your email."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class AccountActivationView(generics.CreateAPIView):
    serializer_class = CodeVerificationSerializer
    permission_classes = [IsAuthenticated, IsSelf]

    def perform_create(self, serializer):
        instance = serializer.save()
        user = self.request.user
        user.is_email_verified = True
        user.save()

    def create(self, request, *args, **kwargs):
        # Done in serializer
        # if request.user.is_email_verified:
        #     return Response(
        #         {"detail": "You have already activated."},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"detail": "You have successfully activated your account."}, status=status.HTTP_200_OK)


class MyCustomBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(Q(username=username) | Q(email=username))
            if user.check_password(password):
                return user
        except Exception as e:
            return None
