from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny

from account.models import User
from jwtauth.serializer import RegistrationSerializer


class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]
