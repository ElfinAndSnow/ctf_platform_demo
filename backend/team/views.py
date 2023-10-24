from account.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from team.models import Team
from team.serializer import TeamSerializer
from utils.custom_permissions import IsTeamLeader

import random
import string
from django.utils import timezone

# team_instance = Team.objects.get(pk=1)
# user_instance = User.objects.get(pk=2)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_team(request):
    if request.method == 'POST':
        serializer = TeamSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                data={"msg": "队伍创建成功", "Team_id:": Team.id},
                status=status.HTTP_201_CREATED
            )
        else:
            error_message = "队伍创建失败: " + ', '.join(serializer.errors)
            return Response(
                data={"msg": error_message},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(
        data={"msg": "未被允许的访问方法"},
        status=status.HTTP_405_METHOD_NOT_ALLOWED
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsTeamLeader])
def delete_team(request, team_id):
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(
            data={"msg": "你试图删除的队伍不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'DELETE':
        team.delete()
        return Response(
            data={"msg": "队伍已成功删除"},
            status=status.HTTP_204_NO_CONTENT
        )


# @api_view(['POST'])
# @permission_classes([IsAuthenticated, IsTeamLeader])
# def invite_member(request, team_id, user_id):
#     try:
#         team = Team.objects.get(id=team_id)
#     except Team.DoesNotExist:
#         return Response(
#             data={"msg": "目标队伍不存在"},
#             status=status.HTTP_404_NOT_FOUND
#         )
#
#     try:
#         user = User.objects.get(id=user_id)
#     except User.DoesNotExist:
#         return Response(
#             data={"msg": "目标用户不存在"},
#             status=status.HTTP_404_NOT_FOUND
#         )
#
#     if request.method == 'POST':
#         # 生成邀请码
#         token = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(12))
#
#         # 设置邀请码有效期


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTeamLeader])
def remove_member(request, team_id, user_id):
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(
            data={"msg": "队伍不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            data={"msg": "该成员不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'POST':
        team.teammate.remove(user)
        return Response(
            data={"msg": "成员移除成功"},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTeamLeader])
def change_team_leader(request, team_id, user_id):
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(
            data={"msg": "所指定的队伍不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        new_leader = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            data={"msg": "目标用户不存在"},
            status=status.HTTP_404_NOT_FOUND
        )

    # 检查当前用户是否是队长
    if request.user != team.leader:
        return Response(
            data={"msg": "You are not the team leader."},
            status=status.HTTP_403_FORBIDDEN
        )

    # 将当前队长设置为队员
    team.teammate.add(request.user)

    # 将新队员设置为队长
    team.leader = new_leader
    team.save()

    return Response(
        data={"msg": "队长变更成功"},
        status=status.HTTP_200_OK
    )

