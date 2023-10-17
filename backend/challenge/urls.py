from django.urls import path

from challenge.views import ChallengeListView, ChallengeRetrieveView

urlpatterns = [
    path(r'challenges/', ChallengeListView.as_view()),
    path(r'challenges/<int:pk>/', ChallengeRetrieveView.as_view()),
]
