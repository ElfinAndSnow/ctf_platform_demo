from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q

from account.models import User, UserChallengeSession
from account.serializer import (UserInfoSerializer, UsernameUpdateSerializer,
                                UserIDSerializer, UserChallengeSessionCreateRetrieveDestroySerializer,
                                FlagSubmissionSerializer)
from challenge.models import Challenge
from utils.custom_permissions import IsAdminOrSessionCreator, IsAdminOrSelf, IsNotPrivateOrSelf, DisallowAny, \
    IsActivatedUser


class UserIDByUsernameView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserIDSerializer
    permission_classes = [IsAdminOrSelf, IsActivatedUser, IsAuthenticated]

    def get_object(self):
        username = self.kwargs['username']
        return self.get_queryset().get(username=username)


class UserChallengeSessionCreateRetrieveDestroyViewSet(viewsets.ModelViewSet):
    queryset = UserChallengeSession
    serializer_class = UserChallengeSessionCreateRetrieveDestroySerializer
    # TODO Change permission class to IsActivatedUser
    permission_classes = [IsActivatedUser, IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        try:
            session = UserChallengeSession.objects.filter(user=user).last()
        except UserChallengeSession.DoesNotExist:
            return Response(
                data={"detail": "You haven't created a session yet."},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_expired = session.expiration_verification()
        if is_expired or session.is_solved:
            return Response(
                data={"detail": "You don't have an open session."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(session)
        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        print("request data: " + str(request.data))
        # 只能给自己创建session
        # if request.user.pk != request.data['user']:
        #     return Response(
        #         data={"detail": "You can only create session for yourself!"},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

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
            session_obj.expiration_verification()
            if not (session_obj.is_solved or session_obj.is_expired):
                return Response(
                    data={"detail": "You have created a session for this challenge!"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        instance.distribute_port()
        instance.create_container(request)
        data = UserChallengeSessionCreateRetrieveDestroySerializer(instance=instance, many=False).data

        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        try:
            session = UserChallengeSession.objects.filter(user=user).last()
        except UserChallengeSession.DoesNotExist:
            return Response(
                data={"detail": "You haven't created a session yet."},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.time_limit = -1
        session.expiration_verification()
        session.save()

        return Response(
            data={"detail": "You have successfully closed your latest open session."},
            status=status.HTTP_200_OK
        )


class UserChallengeSessionGetView(generics.GenericAPIView):
    queryset = UserChallengeSession
    serializer_class = UserChallengeSessionCreateRetrieveDestroySerializer
    permission_classes = [IsAdminOrSessionCreator, IsActivatedUser, IsAuthenticated]

    # def get(self, request, *args, **kwargs):
    #     return list(self, request, *args, **kwargs)
    # def list(self, request, *args, **kwargs):
    #     user = request.user
    #     try:
    #         session = UserChallengeSession.objects.filter(user=user).last()
    #     except UserChallengeSession.DoesNotExist:
    #         return Response(
    #             data={"detail": "You haven't created a session yet."},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
    #
    #     is_expired = session.expiration_verification()
    #     if is_expired or session.is_solved:
    #         return Response(
    #             data={"detail": "You don't have an open session."},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
    #
    #     serializer = self.get_serializer(session)
    #     return Response(
    #         data=serializer.data,
    #         status=status.HTTP_200_OK
    #     )

# class UserChallengeSessionDestroyView(generics.GenericAPIView):
#     queryset = UserChallengeSession
#     serializer_class = UserChallengeSessionCreateRetrieveSerializer
#     permission_classes = [IsAdminOrSessionCreator]

    # def delete(self, request, *args, **kwargs):
    #     user = request.user
    #     try:
    #         session = UserChallengeSession.objects.filter(user=user).last()
    #     except UserChallengeSession.DoesNotExist:
    #         return Response(
    #             data={"detail": "You haven't created a session yet."},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
    #
    #     self.time_limit = -1
    #     self.expiration_verification()
    #
    #     return Response(
    #         data={"detail": "You have successfully closed your latest open session."},
    #         status=status.HTTP_200_OK
    #     )


class FlagSubmissionView(generics.CreateAPIView):
    queryset = UserChallengeSession
    serializer_class = FlagSubmissionSerializer
    permission_classes = [IsAdminOrSessionCreator, IsActivatedUser, IsAuthenticated]

    def perform_create(self, serializer):
        user_challenge_session = serializer.save()
        user_challenge_session.destroy_container()
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
    permission_classes = [IsNotPrivateOrSelf, IsActivatedUser, IsAuthenticated]
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
    permission_classes = [IsAdminOrSelf, IsActivatedUser, IsAuthenticated]


class UserInfoPublicView(generics.GenericAPIView):
    serializer_class = UserInfoSerializer
    permission_classes = [IsActivatedUser, IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            serializer_user = self.serializer_class(user)
            return Response(
                data=serializer_user.data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            error_message = f"自身信息查询失败: {str(e)}"
            return Response(
                data={"msg": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )


