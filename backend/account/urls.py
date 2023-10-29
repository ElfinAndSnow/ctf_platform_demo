from django.urls import path, include
from rest_framework import routers

from account.views import UserIDByUsernameView, UserChallengeSessionCreateRetrieveDestroyViewSet, \
    UserChallengeSessionGetView, \
    FlagSubmissionView, UserInfoViewSet, UsernameUpdateView, UserInfoPublicView

router = routers.DefaultRouter()

router.register("users", UserInfoViewSet)

urlpatterns = [
    path(r'users/user-id-by-username/<str:username>/', UserIDByUsernameView.as_view(), name='user-id-by-username'),
    path(r'challenge-session/',
         UserChallengeSessionCreateRetrieveDestroyViewSet.as_view(
             {'post': 'create', 'get': 'retrieve', 'delete': 'destroy'}
         )
         ),
    # path(r'challenge-session/', UserChallengeSessionGetView.as_view({'get': 'list'})),
    path(r'flag-submission', FlagSubmissionView.as_view()),
    path(r'', include(router.urls)),
    path(r'users/update-username/<int:pk>/', UsernameUpdateView.as_view()),
    path(r'UserInfoPublicView', UserInfoPublicView.as_view(), name='UserInfoPublicView')
]
