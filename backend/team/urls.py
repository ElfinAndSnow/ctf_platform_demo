from django.urls import path
from . import views

urlpatterns = [
    path('create_team/<str:team_name>/', views.create_team, name='create_team'),
    # path(r'DeleteTeamView', views.DeleteTeamView.as_view(), name='DeleteTeamView'),
    path(r'DeleteTeamView', views.DeleteTeamView.as_view(), name='DeleteTeamView'),
    path('join_team/<int:team_id>/<str:invitation_token>/', views.join_team, name='join_team'),
    path('RemoveMemberView/<int:user_id>', views.RemoveMemberView.as_view(), name='RemoveMemberView'),
    path('ChangeTeamLeaderView/<int:user_id>/', views.ChangeTeamLeaderView.as_view(), name='ChangeTeamLeaderView'),
    path(r'GenerateInvitationCodeView', views.GenerateInvitationCodeView.as_view(), name='GenerateInvitationCodeView'),
    path(r'CalculateTeamPointsView/<int:team_id>/', views.CalculateTeamPointsView.as_view(), name='CalculateTeamPointsView'),
]
