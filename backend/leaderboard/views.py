from django.shortcuts import render
from rest_framework import generics

from account.models import User
from leaderboard.serializer import UserPointsLeaderBoardListSerializer, TeamPointsLeaderBoardListSerializer
from team.models import Team


class UserPointsLeaderBoardListView(generics.ListAPIView):
    queryset = User.objects.order_by('-points')
    serializer_class = UserPointsLeaderBoardListSerializer


class TeamPointsLeaderBoardListView(generics.ListAPIView):
    queryset = Team.objects.order_by('-points')
    serializer_class = TeamPointsLeaderBoardListSerializer

