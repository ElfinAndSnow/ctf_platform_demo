from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from account.models import User, UserChallengeSession
from account.serializer import UserIDSerializer, UserChallengeSessionCreateRetrieveSerializer, FlagSubmissionSerializer
from challenge.models import Challenge
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
        # 只能给自己创建session
        if request.user.pk != request.data['user']:
            return Response(
                data={"msg": "You can only create session for yourself!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 如果该题目已被该用户完成，则无法创建session
        user = request.user
        challenge = Challenge.objects.get(id=request.data['challenge'])
        # print(type(challenge.solved_by))
        if user in challenge.solved_by.all():
            return Response(
                data={"msg": "You have already solved this challenge!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 如果用户已创建某一题目的session且is_solved_or_expired=False，则禁止对该题创建新session
        user_challenge_sessions_created = UserChallengeSession.objects.filter(user=user, challenge=challenge)
        print("user_challenge_sessions_created:" + str(user_challenge_sessions_created))
        # filter返回一个存有若干个UserChallengeSession的QuerySet
        # user_challenge_sessions_created:
        # <QuerySet [<UserChallengeSession: [OPEN]user1_lunatic web_2023-10-18 02:00:30.762051+00:00>]>
        for session_obj in user_challenge_sessions_created:
            if not session_obj.is_solved_or_expired:
                return Response(
                    data={"msg": "You have created a session for this challenge!"},
                    status=status.HTTP_400_BAD_REQUEST
                )

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
        # TODO
        # serializer里少东西生成headers时会报错，待解决
        # headers = self.get_success_headers(serializer.data)
        return Response({"msg": "You get the correct answer!"}, status=status.HTTP_201_CREATED)
