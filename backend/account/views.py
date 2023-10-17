from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from account.models import User, UserChallengeSession
from account.serializer import UserIDSerializer, UserChallengeSessionCreateRetrieveSerializer
from utils.custom_permissions import IsAdminOrSessionCreator


class UserIDByUsernameView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserIDSerializer

    def get_object(self):
        username = self.kwargs['username']
        return self.get_queryset().get(username=username)


class UserChallengeSessionCreateView(generics.CreateAPIView):
    queryset = UserChallengeSession
    serializer_class = UserChallengeSessionCreateRetrieveSerializer

    permission_classes = [IsAuthenticated]


class UserChallengeSessionRetrieveView(generics.RetrieveAPIView):
    queryset = UserChallengeSession
    serializer_class = UserChallengeSessionCreateRetrieveSerializer

    permission_classes = [IsAdminOrSessionCreator]
