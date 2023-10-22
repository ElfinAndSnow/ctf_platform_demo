from django.urls import path

from leaderboard.views import UserPointsLeaderBoardListView, TeamPointsLeaderBoardListView

urlpatterns = [
    path(r'leaderboard/users/', UserPointsLeaderBoardListView.as_view()),
    path(r'leaderboard/teams/', TeamPointsLeaderBoardListView.as_view()),
]
