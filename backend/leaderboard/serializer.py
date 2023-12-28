from rest_framework import serializers

from account.models import User
from challenge.serializer import ChallengeSerializer
from team.models import Team


class UserPointsLeaderBoardListSerializer(serializers.ModelSerializer):
    solved_challenges = ChallengeSerializer(many=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'points',
            'solved_challenges',
        ]


class TeamPointsLeaderBoardListSerializer(serializers.ModelSerializer):
    # [
    #     {
    #         "id": 1,
    #         "name": "team1",
    #         "points": 200,
    #         "solved_challenges_team": [
    #             {
    #                 "id": 1,
    #                 "name": "easy pwn",
    #                 "type": "PWN",
    #                 "description": "简单PWN一道~"
    #             },
    #             {
    #                 "id": 2,
    #                 "name": "lunatic web",
    #                 "type": "WEB",
    #                 "description": "LUNATIC!!!"
    #             }
    #         ]
    #     }
    # ]
    solved_challenges_team = ChallengeSerializer(many=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'points',
            'solved_challenges_team',
        ]
