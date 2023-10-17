from rest_framework import serializers
from .models import User, UserChallengeSession


# 暂时不需要，因为login和register的视图和序列化器要单独写
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class UserIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
        ]


class UserChallengeSessionCreateRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChallengeSession
        fields = [
            'user',
            'challenge',
        ]
