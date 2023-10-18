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
            'id',
            'user',
            'challenge',
        ]


class FlagSubmissionSerializer(serializers.ModelSerializer):
    # UserChallengeSession没有这俩field
    user_flag = serializers.CharField(max_length=100)
    user_challenge_session_id = serializers.IntegerField()

    class Meta:
        model = UserChallengeSession
        fields = [
            'user_challenge_session_id',
            'user_flag',
        ]

    def create(self, validated_data):
        user_challenge_session_id = validated_data.get('user_challenge_session_id')
        user_flag = validated_data.get('user_flag')
        try:
            user_challenge_session = UserChallengeSession.objects.get(id=user_challenge_session_id)
        except UserChallengeSession.DoesNotExist:
            raise serializers.ValidationError("Session not found!")

        if user_challenge_session.is_solved_or_expired:
            raise serializers.ValidationError("Session is closed.")

        is_expired = user_challenge_session.expiration_verification()
        if is_expired:
            user_challenge_session.is_solved_or_expired = True
            user_challenge_session.save()
            raise serializers.ValidationError("Time limit exceeded. Session is closed.")

        is_correct = user_challenge_session.flag_verification(user_flag)
        if not is_correct:
            raise serializers.ValidationError("Incorrect answer.")

        # session = UserChallengeSession.objects.get(id=user_challenge_session_id)
        # session.is_solved_or_expired = True
        # session.save()
        return user_challenge_session
