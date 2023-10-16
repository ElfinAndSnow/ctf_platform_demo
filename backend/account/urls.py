from django.urls import path

from account.views import UserIDByUsernameView

urlpatterns = [
    path(r'user-id-by-username/<str:username>/', UserIDByUsernameView.as_view(), name='user-id-by-username')
]
