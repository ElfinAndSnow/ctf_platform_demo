from django.urls import path
from . import views

urlpatterns = [
    path('create_team/<str:team_name>/', views.create_team, name='create_team'),
    # path(r'delete_team/<int:pk>/', views.DeleteTeamView.as_view(), name='delete_team'),
    path('delete_team', views.delete_team, name='delete_team'),
    path('join_team/<int:user_id>/', views.join_team, name='join_team'),
    path('remove_member/<int:user_id>', views.remove_member, name='remove_member'),
    path('change_team_leader/<int:user_id>/', views.change_team_leader, name='change_team_leader'),
]
