from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from account.models import User, UserPuzzleSession
from account.serializer import UserIDSerializer, UserPuzzleSessionCreateRetrieveSerializer
from utils.custom_permissions import IsAdminOrSessionCreator


class UserIDByUsernameView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserIDSerializer

    def get_object(self):
        username = self.kwargs['username']
        return self.get_queryset().get(username=username)


class UserPuzzleSessionCreateView(generics.CreateAPIView):
    queryset = UserPuzzleSession
    serializer_class = UserPuzzleSessionCreateRetrieveSerializer

    permission_classes = [IsAuthenticated]


class UserPuzzleSessionRetrieveView(generics.RetrieveAPIView):
    queryset = UserPuzzleSession
    serializer_class = UserPuzzleSessionCreateRetrieveSerializer

    permission_classes = [IsAdminOrSessionCreator]
