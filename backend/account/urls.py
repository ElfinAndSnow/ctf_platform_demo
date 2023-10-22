from django.urls import path, include
from rest_framework import routers

from account.views import UserIDByUsernameView, UserChallengeSessionCreateView, UserChallengeSessionRetrieveView, \
    FlagSubmissionView, UserInfoViewSet, UsernameUpdateView

router = routers.DefaultRouter()

router.register("users", UserInfoViewSet)

urlpatterns = [
    path(r'users/user-id-by-username/<str:username>/', UserIDByUsernameView.as_view(), name='user-id-by-username'),
    path(r'challenge-session/', UserChallengeSessionCreateView.as_view()),
    path(r'challenge-session/<int:pk>/', UserChallengeSessionRetrieveView.as_view()),
    path(r'flag-submission', FlagSubmissionView.as_view()),
    path(r'', include(router.urls)),
    path(r'users/update-username/<int:pk>/', UsernameUpdateView.as_view()),
]
