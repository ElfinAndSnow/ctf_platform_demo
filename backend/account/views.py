from rest_framework import generics

from account.models import User
from account.serializer import UserIDSerializer


class UserIDByUsernameView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserIDSerializer

    def get_object(self):
        username = self.kwargs['username']
        return self.get_queryset().get(username=username)
