from rest_framework import serializers

from challenge.models import Challenge


class ChallengeSerializer(serializers.ModelSerializer):
    is_solved_by_current_user = serializers.SerializerMethodField('_get_is_solved_by_current_user')
    is_solved_by_current_team = serializers.SerializerMethodField('_get_is_solved_by_current_team')

    def _get_is_solved_by_current_user(self, obj):
        user = self.context['request'].user
        return user in obj.solved_by.all()

    def _get_is_solved_by_current_team(self, obj):
        user = self.context['request'].user
        if not user.team:
            return False
        team = user.team
        return team in obj.solved_by_teams.all()

    class Meta:
        model = Challenge
        fields = [
            'id',
            'name',
            'type',
            'description',
            'is_solved_by_current_user',
            'is_solved_by_current_team',
            'points',
            'file',
        ]
