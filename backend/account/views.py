from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q

from account.models import User, UserChallengeSession
from account.serializer import UserInfoSerializer, UsernameUpdateSerializer, UserIDSerializer, UserChallengeSessionCreateRetrieveSerializer, FlagSubmissionSerializer
from challenge.models import Challenge
from utils.custom_permissions import IsAdminOrSessionCreator, IsAdminOrSelf, IsNotPrivateOrSelf, DisallowAny


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
                data={"detail": "You can only create session for yourself!"},
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
            if not (session_obj.is_solved and session_obj.is_expired):
                return Response(
                    data={"detail": "You have created a session for this challenge!"},
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
        # 给用户加分
        user.check_points()
        if user.team:
            user.team.check_points()
        # for solved_challenge in user.solved_challenges.all():
        #     print(solved_challenge.name)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # TODO
        # serializer里少东西生成headers时会报错，待解决
        # headers = self.get_success_headers(serializer.data)
        return Response({"detail": "You get the correct answer!"}, status=status.HTTP_200_OK)


# 用户信息接口
class UserInfoViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserInfoSerializer
    permission_classes = [IsNotPrivateOrSelf, IsAuthenticated]
    # 要根据访问的用户重写get_permissions
    # 同时在自定义权限里增加一些权限
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [DisallowAny]
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsNotPrivateOrSelf, IsAuthenticated]
        else:
            permission_classes = [IsAdminOrSelf, IsAuthenticated]
        return [permission() for permission in permission_classes]

    # 验证is_private应转移到序列化器中进行
    # 好像不能在序列化器里操作queryset，只好在视图里验证了
    def get_queryset(self):
        return User.objects.filter(Q(id=self.request.user.id) | Q(is_private=False))


class UsernameUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UsernameUpdateSerializer
    permission_classes = [IsAdminOrSelf, IsAuthenticated]
