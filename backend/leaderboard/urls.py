from django.urls import path

from leaderboard.views import UserPointsLeaderBoardListView

urlpatterns = [
    path(r'leaderboard/points/', UserPointsLeaderBoardListView.as_view()),
]
