from rest_framework import serializers

from challenge.serializer import ChallengeSerializer
from .models import User, UserChallengeSession


class UserInfoSerializer(serializers.ModelSerializer):
    # TODO TeamInfoSerializer嵌套
    # team = TeamInfoSerializer
    # {
    #     "username": "xxx",
    #     "team": {
    #         "name": "ccc",
    #         "description": "bbb"
    #     }
    # }
    # points = serializers.ReadOnlyField(source='get_points_display')
    solved_challenges = ChallengeSerializer(many=True)

    class Meta:
        model = User
        # fields = '__all__'
        fields = [
            'id',
            'username',
            'description',
            'is_private',
            'points',
            'team',
            'date_joined',
            'solved_challenges',
            # 由于使用jwt认证，last_login不刷新
            # 'last_login',
        ]
        read_only_fields = [
            'username',
            'id',
            'points',
            'team',
            'solved_challenges',
        ]


class UsernameUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
        ]
        extra_kwargs = {
            'username': {
                'write_only': True,
            },
        }

    def to_representation(self, obj):
        data = super().to_representation(obj)
        # 对序列化数据做修改，添加新的数据
        serializer = UserInfoSerializer(instance=obj)
        print(serializer.data)
        data.update(serializer.data)
        return data


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
