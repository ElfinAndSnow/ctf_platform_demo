from rest_framework import serializers
from .models import Team


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class CustomResponseSerializer(serializers.Serializer):
    msg = serializers.CharField()


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
            'teammate',
        ]