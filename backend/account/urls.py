from django.urls import path

from account.views import UserIDByUsernameView, UserChallengeSessionCreateView, UserChallengeSessionRetrieveView

urlpatterns = [
    path(r'user-id-by-username/<str:username>/', UserIDByUsernameView.as_view(), name='user-id-by-username'),
    path(r'puzzle-session/', UserChallengeSessionCreateView.as_view()),
    path(r'puzzle-session/', UserChallengeSessionRetrieveView.as_view()),
]
