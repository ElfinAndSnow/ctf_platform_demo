from django.shortcuts import render
from rest_framework import generics

from account.models import User
from leaderboard.serializer import UserPointsLeaderBoardListSerializer


class UserPointsLeaderBoardListView(generics.ListAPIView):
    queryset = User.objects.order_by('-points')
    serializer_class = UserPointsLeaderBoardListSerializer
