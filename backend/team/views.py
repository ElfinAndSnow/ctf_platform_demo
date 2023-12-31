from account.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, NotFound

from team.models import Team
from team.serializer import TeamSerializer, TeamInfoSerializer, PartialSerializer, TeamScoreSerializer
from utils.custom_permissions import IsTeamLeader, IsTeamMate, IsActivatedUser

import random
import string

from django.db import IntegrityError


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsActivatedUser])
def create_team(request, team_name):
    if request.method == 'POST':
        user = request.user

        if user.team:
            return Response(
                data={"msg": "已经是战队的成员了，无法创建队伍"},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_team = Team.objects.filter(name=team_name).exists()
        if existing_team:
            return Response(
                data={"msg": f"队伍名称 '{team_name}' 已存在,请更换其他的名称"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            team = Team(name=team_name, leader=user)
            team.save()
            team.members.add(user)
            team.check_points()
            team.save()
            return Response(
                data={"msg": "队伍创建成功", "Team_id:": team.id, "Team_name:": team_name, "The user id of leader:": user.id},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            error_message = f"队伍创建失败: {str(e)}"
            return Response(
                data={"msg": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(
        data={"msg": "未被允许的访问方法"},
        status=status.HTTP_405_METHOD_NOT_ALLOWED
    )


class DeleteTeamView(generics.DestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser, IsTeamLeader]

    def get_object(self):
        try:
            team = self.request.user.team
            if team:
                return team
            else:
                raise Team.DoesNotExist  # 触发异常以后续处理
        except Team.DoesNotExist:
            return None  # 返回None表示队伍不存在

    def destroy(self, request, *args, **kwargs):
        team = self.get_object()

        if team is None:
            return Response(
                data={"msg": "队伍不存在"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 检查当前用户是否是队长
        if request.user != team.leader:
            return Response(
                data={"msg": "你不是队长，无法解散队伍"},
                status=status.HTTP_403_FORBIDDEN
            )

        team.delete()
        request.user.team = None
        return Response(
            data={"msg": "队伍已成功解散"},
            status=status.HTTP_204_NO_CONTENT
        )


# class JoinTeamView(generics.UpdateAPIView):
#     queryset = Team.objects.all()
#     serializer_class = TeamSerializer
#     permission_classes = [IsAuthenticated]
#     lookup_url_kwarg = 'team_name'
#
#     def update(self, request, *args, **kwargs):
#         team_name = self.kwargs.get(self.lookup_url_kwarg)
#         invitation_token = request.data.get('invitation_token')
#
#         if not team_name:
#             return Response(
#                 data={"msg": "请提供队伍名称"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#
#         try:
#             team = Team.objects.get(name=team_name)
#         except Team.DoesNotExist:
#             return Response(
#                 data={"msg": "未找到对应的队伍，请检查队伍名称是否正确"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#
#         if team.invitation_token == invitation_token:
#             user = request.user
#             user.team = team
#             user.save()
#
#             team.members.add(user)
#             team.check_points()
#             team.save()
#
#             return Response(
#                 data={"msg": "成功加入战队"},
#                 status=status.HTTP_200_OK
#             )
#         else:
#             return Response(
#                 data={"msg": "邀请码错误，无法加入战队"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsActivatedUser])
def join_team_id(request, team_id, invitation_token):
    user = request.user

    if user.team:
        return Response(
            data={"msg": "你已经是战队的成员了"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(
            data={"msg": "目标战队不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

        # 检查邀请码是否匹配
    if invitation_token != team.invitation_token:
        return Response(
            data={"msg": "邀请码错误或无效"},
            status=status.HTTP_400_BAD_REQUEST
        )

        # 成为战队队员
    team.members.add(user)
    team.check_points()

    return Response(
        data={"msg": "成功加入战队"},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsActivatedUser])
def join_team_name(request, team_name, invitation_token):
    user = request.user

    if user.team:
        return Response(
            data={"msg": "你已经是战队的成员了"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        team = Team.objects.get(name=team_name)
    except Team.DoesNotExist:
        return Response(
            data={"msg": "目标战队不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

        # 检查邀请码是否匹配
    if invitation_token != team.invitation_token:
        return Response(
            data={"msg": "邀请码错误或无效"},
            status=status.HTTP_400_BAD_REQUEST
        )

        # 成为战队队员
    team.members.add(user)
    team.check_points()

    return Response(
        data={"msg": "成功加入战队"},
        status=status.HTTP_200_OK
    )


class RemoveMemberView(generics.DestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser, IsTeamLeader]  # 请替换IsTeamLeader为实际的权限类
    lookup_url_kwarg = 'username'  # 这将匹配URL中的user_id参数

    def get_object(self):
        team = self.request.user.team
        return team

    def destroy(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            team = self.get_object()
            username = self.kwargs[self.lookup_url_kwarg]
            leader = team.leader

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response(
                    data={"msg": "该用户id指向的用户不存在"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if user in team.members.all() and user != leader:
                team.members.remove(user)
                user.team = None
                team.check_points()
                return Response(
                    data={"msg": "成员移除成功"},
                    status=status.HTTP_200_OK
                )
            elif user == leader:
                return Response(
                    data={"msg": "队长无法将自身移除出队伍"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    data={"msg": "该成员不是队伍成员"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                data={"msg": "Method not allowed."},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )


class ChangeTeamLeaderView(generics.UpdateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser, IsTeamLeader]
    lookup_url_kwarg = 'username'  # This will match the user_id parameter in the URL

    def get_object(self):
        team = self.request.user.team
        return team

    def update(self, request, *args, **kwargs):
        team = self.get_object()
        username = self.kwargs[self.lookup_url_kwarg]
        leader = team.leader

        try:
            new_leader = User.objects.get(username=username)
            if new_leader not in team.members.all():
                return Response(
                    data={"msg": "该成员不在队伍当中"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                data={"msg": "目标用户不存在"},
                status=status.HTTP_404_NOT_FOUND
            )

        if new_leader == leader:
            return Response(
                data={"msg": "當前用戶已經是隊長了"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the current user is the team leader
        if request.user != team.leader:
            return Response(
                data={"msg": "You are not the team leader."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Set the new leader
        team.leader = new_leader
        team.save()

        return Response(
            data={"msg": "队长变更成功"},
            status=status.HTTP_200_OK
        )


class GenerateInvitationCodeView(generics.CreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser, IsTeamLeader]  # 请替换IsTeamLeader为实际的权限类

    def get_object(self):
        team = self.request.user.team
        return team

    def create(self, request, *args, **kwargs):
        # 生成随机12位邀请码
        invitation_code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(12))

        # 获取当前用户的队伍
        team = self.get_object()

        # 将邀请码保存到队伍中
        team.invitation_token = invitation_code
        team.save()

        return Response(
            data={"msg": "邀请码生成成功", "invitation_code": invitation_code},
            status=status.HTTP_201_CREATED
        )


# class CalculateTeamPointsView(generics.GenericAPIView):
#     serializer_class = TeamSerializer
#     permission_classes = [IsAuthenticated, IsActivatedUser]
#
#     def get_object(self, team_id):
#         try:
#             team = Team.objects.get(pk=team_id)
#             return team
#         except Team.DoesNotExist:
#             return None
#
#     def calculate_team_points(self, team):
#         team.check_points()
#
#     def get(self, request, *args, **kwargs):
#         team_id = kwargs.get('team_id')
#         # 获取队伍ID
#         team = self.get_object(team_id)
#
#         if not team:
#             return Response(
#                 data={"msg": "目标队伍不存在"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#
#         # 调用计算队伍总分的方法
#         self.calculate_team_points(team)
#
#         updated_team = self.get_object(team_id)
#         if updated_team:
#             points = updated_team.points
#
#             return Response(
#                 data={"msg": "队伍总分已计算", "总分为:": points},
#                 status=status.HTTP_200_OK
#             )
#         else:
#             return Response(
#                 data={"msg": "队伍分数更新失败"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
class CalculateTeamPointsView(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser]

    def get_team_for_user(self, username):
        try:
            user = User.objects.get(username=username)
            if user.team:
                return user.team
        except User.DoesNotExist:
            raise NotFound(detail="该用户未加入队伍")
        raise NotFound(detail="目标队伍不存在")

    def calculate_team_points(self, team):
        team.check_points()
        team.save()

    def get(self, request, *args, **kwargs):
        username = kwargs.get('username')
        # 获取队伍ID
        try:
            team = self.get_team_for_user(username)
        except NotFound as e:
            return Response(data={'msg': str(e)}, status=status.HTTP_404_NOT_FOUND)

        # 调用计算队伍总分的方法
        self.calculate_team_points(team)

        points = team.points
        return Response(
            data={"msg": "队伍总分已计算", "总分为:": points},
            status=status.HTTP_200_OK
        )


class CalculateTeamChallengeView(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser]

    def get_object(self, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            return team
        except Team.DoesNotExist:
            return None

    def calculate_team_challenges(self, team):
        team.check_points()

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        # 获取队伍ID
        team = self.get_object(team_id)

        if not team:
            return Response(
                data={"msg": "目标队伍不存在"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 调用计算队伍总分的方法
        self.calculate_team_challenges(team)

        updated_team = self.get_object(team_id)
        if updated_team:
            challenges = updated_team.challenges_solved

            return Response(
                data={"msg": "队伍总解出题数已统计", "总数为:": challenges},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                data={"msg": "队伍总解出题数更新失败"},
                status=status.HTTP_400_BAD_REQUEST
            )


class QueryTeamByIDView(generics.GenericAPIView):
    serializer_class = PartialSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser]

    def get_object(self, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            return team
        except Team.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        # 获取队伍ID
        if team_id < 0 or team_id > 65535:
            return Response(
                data={"msg": "队伍ID不在有效查询范围内！"},
                status=status.HTTP_400_BAD_REQUEST
            )
        team = self.get_object(team_id)

        if not team:
            return Response(
                data={"msg": "查询ID对应的队伍不存在"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer_team = self.get_serializer(team)
        return Response(
            data=serializer_team.data,
            status=status.HTTP_200_OK
        )


class QueryTeamByNameView(generics.GenericAPIView):
    serializer_class = PartialSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser]

    def get_object(self, team_name):
        try:
            team = Team.objects.get(name=team_name)
            return team
        except Team.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        team_name = kwargs.get('team_name')

        print("team_name:", team_name)

        if not team_name:
            return Response(
                data={"msg": "请提供队伍名称"},
                status=status.HTTP_400_BAD_REQUEST
            )

        team = self.get_object(team_name)

        if not team:
            return Response(
                data={"msg": "未找到名为 '{}' 的队伍".format(team_name)},
                status=status.HTTP_404_NOT_FOUND
            )

        serialized_team = self.get_serializer(team)
        return Response(
            data=serialized_team.data,
            status=status.HTTP_200_OK
        )


class TeamInfoForMemberView(generics.GenericAPIView):
    serializer_class = TeamInfoSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser, IsTeamMate]

    def get_object(self):
        try:
            team = self.request.user.team
        except Team.DoesNotExist:
            raise NotFound(detail="該用戶不在隊伍中")
        if not team:
            raise NotFound(detail="該用戶不在隊伍中")
        return team

    def get(self, request, *args, **kwargs):
        team = self.get_object()

        serialized_team = self.get_serializer(team)

        return Response(
            data=serialized_team.data,
            status=status.HTTP_200_OK
        )


class UpdateTeamScoresAndChallengesView(generics.GenericAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser, IsTeamMate]

    def get_object(self):
        try:
            team = self.request.user.team
        except Team.DoesNotExist:
            return None
        return team

    def calculate_team_challenges(self, team):
        return team.check_points()[1]   # @return integer

    def get(self, request, *args, **kwargs):
        team = self.get_object()
        if not team:
            return Response(
                data={"msg": "你所属的队伍不存在"},
                status=status.HTTP_400_BAD_REQUEST
            )

        points = team.points
        challenges = self.calculate_team_challenges(team)

        return Response(
            data={"msg": "队伍总分及解出题数已经更新", "scores:": points, "challenges_solved:": challenges},
            status=status.HTTP_200_OK
        )


class TeamScoreListView(generics.ListAPIView):
    queryset = Team.objects.order_by('-points')
    permission_classes = [IsAuthenticated]
    serializer_class = TeamScoreSerializer
