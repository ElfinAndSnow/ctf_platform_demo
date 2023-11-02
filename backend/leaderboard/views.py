from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from account.models import User
from leaderboard.serializer import UserPointsLeaderBoardListSerializer, TeamPointsLeaderBoardListSerializer
from team.models import Team
from utils.custom_permissions import IsActivatedUser


class UserPointsLeaderBoardListView(generics.ListAPIView):
    queryset = User.objects.order_by('-points')
    serializer_class = UserPointsLeaderBoardListSerializer
    permission_classes = [IsActivatedUser, IsAuthenticated]


class TeamPointsLeaderBoardListView(generics.ListAPIView):
    queryset = Team.objects.order_by('-points')
    serializer_class = TeamPointsLeaderBoardListSerializer
    permission_classes = [IsActivatedUser, IsAuthenticated]

