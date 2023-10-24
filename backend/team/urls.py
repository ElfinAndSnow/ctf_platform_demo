from django.urls import path
from . import views

urlpatterns = [
    # path('invite/<int:team_id>/<int:user_id>/', views.invite_member, name='invite_member'),
    path('create_team/', views.create_team, name='create_team'),
    path('delete_team/<int:team_id>/', views.delete_team, name='delete_team'),
    path('change_team_leader/<int:team_id>/<int:user_id>/', views.change_team_leader, name='change_team_leader'),
    # path('remove_member/')
]
