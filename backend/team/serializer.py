from rest_framework import serializers
from .models import Team
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