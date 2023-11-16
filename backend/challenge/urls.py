from django.urls import path, include
from rest_framework import routers

from challenge.views import ChallengeListView, ChallengeRetrieveView, ChallengeFileDownloadViewSet

router = routers.DefaultRouter()

router.register("challenge-file-download", ChallengeFileDownloadViewSet)

urlpatterns = [
    path(r'challenges/', ChallengeListView.as_view()),
    path(r'challenges/<int:pk>/', ChallengeRetrieveView.as_view()),
    # path(r'', include(router.urls)),
    path(r'challenge-file-download/<int:pk>/', ChallengeFileDownloadViewSet.as_view(
        {
            'get': 'download'
        }
    ))
]
