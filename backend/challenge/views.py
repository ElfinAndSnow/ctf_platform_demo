from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from challenge.models import Challenge
from challenge.serializer import ChallengeSerializer
from utils.custom_permissions import IsActivatedUser


class ChallengeListView(generics.ListAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsActivatedUser, IsAuthenticated]


class ChallengeRetrieveView(generics.RetrieveAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsActivatedUser, IsAuthenticated]
