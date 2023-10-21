from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny

from account.models import User
from jwtauth.serializer import RegistrationSerializer
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from account.models import User


class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]

class MyCustomBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(Q(username=username) | Q(email=username))
            if user.check_password(password):
                return user
        except Exception as e:
            return None
