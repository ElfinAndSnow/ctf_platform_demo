from rest_framework import serializers

from account.models import User


class UserPointsLeaderBoardListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'points'
        ]
