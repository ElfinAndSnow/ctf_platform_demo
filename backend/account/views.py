from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from account.models import User, UserChallengeSession
from account.serializer import UserIDSerializer, UserChallengeSessionCreateRetrieveSerializer, FlagSubmissionSerializer
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

    def create(self, request, *args, **kwargs):
        print("request data: " + str(request.data))
        if request.user.pk != request.data['user']:
            return Response(data="You can only create session for yourself!", status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class UserChallengeSessionRetrieveView(generics.RetrieveAPIView):
    queryset = UserChallengeSession
    serializer_class = UserChallengeSessionCreateRetrieveSerializer

    permission_classes = [IsAdminOrSessionCreator]


class FlagSubmissionView(generics.CreateAPIView):
    queryset = UserChallengeSession
    serializer_class = FlagSubmissionSerializer
    permission_classes = [IsAdminOrSessionCreator]

    def perform_create(self, serializer):
        user_challenge_session = serializer.save()
        user = self.request.user
        challenge = user_challenge_session.challenge
        challenge.solved_by.add(user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # headers = self.get_success_headers(serializer.data)
        return Response({"msg": "You get the correct answer!"}, status=status.HTTP_201_CREATED)

