from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from account.models import User
from jwtauth.models import EmailVerification
from jwtauth.serializer import RegistrationSerializer, PasswordResetSerializer, CodeVerificationSerializer, \
    EmailVerificationCreateSerializer
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from account.models import User
from utils.custom_permissions import IsSelf, IsAdminOrSessionCreator
from utils.email_verification import email_verification


class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny, ]


class PasswordResetView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = PasswordResetSerializer
    permission_classes = [IsSelf, ]


class EmailVerificationCreateView(generics.CreateAPIView):
    queryset = EmailVerification
    permission_classes = [IsAdminOrSessionCreator, ]
    serializer_class = EmailVerificationCreateSerializer

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        # These should be implemented in serializer's validate()
        # print("pk: " + str(request.user.id))
        # if str(request.user.id) != request.data.get('user'):
        #     return Response(
        #         data={"detail": "You can only create verification for yourself!"},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        #
        # user = request.user
        # for instance in user.email_verifications.all():
        #     if not (instance.is_verified and instance.is_expired):
        #         return Response(
        #             data={"detail": "Please wait for your last verification code expires."},
        #             status=status.HTTP_400_BAD_REQUEST
        #         )
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # send email
        # data = {
        #     'username': request.user.username,
        #     'email': request.user.email,
        # }
        # purpose = request.data['purpose']
        email_verification(instance=instance)

        return Response(
            {"detail": "An email including a verify code has been sent to your email."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class AccountActivationView(generics.CreateAPIView):
    serializer_class = CodeVerificationSerializer
    permission_classes = [IsSelf, ]

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
