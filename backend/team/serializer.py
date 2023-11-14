from rest_framework import serializers
from .models import Team, TeamScore
from account.serializer import UserInfoSerializer


class TeamSerializer(serializers.ModelSerializer):
    members = UserInfoSerializer(many=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'description',
            'points',
            'challenges_solved',
            'leader',
            'members',
        ]


class PartialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'description',
            'points',
            'challenges_solved',
            'leader',
        ]


class TScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamScore
        fields = [
            'solved_at',
            'current_points',
        ]


class TeamScoreSerializer(serializers.ModelSerializer):
    teamscore_set = TScoreSerializer(many=True)

    class Meta:
        model = Team
        fields = [
            'name',
            'teamscore_set',
        ]
