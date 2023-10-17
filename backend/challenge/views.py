from django.shortcuts import render
from rest_framework import generics

from challenge.models import Challenge
from challenge.serializer import ChallengeSerializer


class ChallengeListView(generics.ListAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer


class ChallengeRetrieveView(generics.RetrieveAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
