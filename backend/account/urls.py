from django.urls import path

from account.views import UserIDByUsernameView, UserPuzzleSessionCreateView, UserPuzzleSessionRetrieveView

urlpatterns = [
    path(r'user-id-by-username/<str:username>/', UserIDByUsernameView.as_view(), name='user-id-by-username'),
    path(r'puzzle-session/', UserPuzzleSessionCreateView.as_view()),
    path(r'puzzle-session/', UserPuzzleSessionRetrieveView.as_view()),
]
