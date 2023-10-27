from account.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated

from team.models import Team
from team.serializer import TeamSerializer, CustomResponseSerializer
from utils.custom_permissions import IsTeamLeader

import random
import string


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_team(request, team_name):
    if request.method == 'POST':
        user = request.user

        if user.team:
            return Response(
                data={"msg": "已经是战队的成员了，无法创建队伍"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            team = Team(name=team_name, leader=user)
            team.save()

            user.team = team
            user.save()

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
    permission_classes = [IsAuthenticated, IsTeamLeader]

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
                data={"msg": "你不是队长，无法删除队伍"},
                status=status.HTTP_403_FORBIDDEN
            )

        team.delete()
        return Response(
            data={"msg": "队伍已成功删除"},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_team(request, team_id, invitation_token):
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
            data={"msg": "邀请码无效"},
            status=status.HTTP_400_BAD_REQUEST
        )

        # 成为战队队员
    team.teammate.add(user)
    user.team = team
    user.save()

    return Response(
        data={"msg": "成功加入战队"},
        status=status.HTTP_200_OK
    )


class RemoveMemberView(generics.DestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsTeamLeader]  # 请替换IsTeamLeader为实际的权限类
    lookup_url_kwarg = 'user_id'  # 这将匹配URL中的user_id参数

    def get_object(self):
        team = self.request.user.team
        return team

    def destroy(self, request, *args, **kwargs):
        if request.method == 'DELETE':
            team = self.get_object()
            user_id = self.kwargs[self.lookup_url_kwarg]

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    data={"msg": "该用户id指向的用户不存在"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if user in team.teammate.all():
                team.teammate.remove(user)
                user.team = None
                user.save()
                return Response(
                    data={"msg": "成员移除成功"},
                    status=status.HTTP_200_OK
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
    permission_classes = [IsAuthenticated, IsTeamLeader]  # Replace IsTeamLeader with your actual permission class
    lookup_url_kwarg = 'user_id'  # This will match the user_id parameter in the URL

    def get_object(self):
        team = self.request.user.team
        return team

    def update(self, request, *args, **kwargs):
        team = self.get_object()
        user_id = self.kwargs[self.lookup_url_kwarg]

        try:
            new_leader = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                data={"msg": "目标用户不存在"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if the current user is the team leader
        if request.user != team.leader:
            return Response(
                data={"msg": "You are not the team leader."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Change the team leader by adding the current leader to teammates
        team.teammate.add(request.user)

        # Set the new leader
        team.leader = new_leader
        team.save()

        return Response(
            data={"msg": "队长变更成功"},
            status=status.HTTP_200_OK
        )


class GenerateInvitationCodeView(generics.CreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsTeamLeader]  # 请替换IsTeamLeader为实际的权限类

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


class CalculateTeamPointsView(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            return team
        except Team.DoesNotExist:
            return None

    def calculate_team_points(self, team):
        team.check_points()

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        # 获取队伍ID
        team = self.get_object(team_id)

        if not team:
            return Response(
                data={"msg": "目标队伍不存在" },
                status=status.HTTP_404_NOT_FOUND
            )

        # 调用计算队伍总分的方法
        self.calculate_team_points(team)

        updated_team = self.get_object(team_id)
        if updated_team:
            points = updated_team.points

            return Response(
                data={"msg": "队伍总分已计算", "总分为:": points},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                data={"msg": "队伍分数更新失败"},
                status=status.HTTP_400_BAD_REQUEST
            )


class CalculateTeamChallengeView(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, team_id):
        try:
            team = Team.objects.get(pk=team_id)
            return team
        except Team.DoesNotExist:
            return None

    def calculate_team_challenges(self, team):
        team.check_challenges()

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        # 获取队伍ID
        team = self.get_object(team_id)

        if not team:
            return Response(
                data={"msg": "目标队伍不存在" },
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
