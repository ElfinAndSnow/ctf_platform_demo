from django.urls import path
from . import views
from .views import TeamScoreListView

urlpatterns = [
    path('create_team/<str:team_name>/', views.create_team, name='create_team'),
    # path(r'DeleteTeamView', views.DeleteTeamView.as_view(), name='DeleteTeamView'),
    path(r'DeleteTeamView', views.DeleteTeamView.as_view(), name='DeleteTeamView'),
    path('join_team_name/<str:team_name>/<str:invitation_token>/', views.join_team_name, name='join_team_name'),
    path('join_team_id/<int:team_id>/<str:invitation_token>/', views.join_team_id, name='join_team_id'),
    path('RemoveMemberView/<str:username>', views.RemoveMemberView.as_view(), name='RemoveMemberView'),
    path('ChangeTeamLeaderView/<str:username>/', views.ChangeTeamLeaderView.as_view(), name='ChangeTeamLeaderView'),
    path(r'GenerateInvitationCodeView', views.GenerateInvitationCodeView.as_view(), name='GenerateInvitationCodeView'),
    path(r'CalculateTeamPointsView/<str:username>/', views.CalculateTeamPointsView.as_view(),
         name='CalculateTeamPointsView'),
    path(r'CalculateTeamChallengeView/<int:team_id>/', views.CalculateTeamChallengeView.as_view(),
         name='CalculateTeamChallengeView'),
    path(r'QueryTeamByIDView/<int:team_id>/', views.QueryTeamByIDView.as_view(), name='QueryTeamByIDView'),
    path(r'QueryTeamByNameView/<str:team_name>/', views.QueryTeamByNameView.as_view(), name='QueryTeamByNameView'),
    path(r'TeamInfoForMemberView', views.TeamInfoForMemberView.as_view(), name='TeamInfoForMemberView'),
    path(r'UpdateTeamScoresAndChallengesView', views.UpdateTeamScoresAndChallengesView.as_view(),
         name='UpdateTeamScoresAndChallengesView'),
    path(r'team-scores/', TeamScoreListView.as_view()),
]
