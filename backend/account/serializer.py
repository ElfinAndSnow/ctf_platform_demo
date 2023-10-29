from rest_framework import serializers, status

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
            'is_email_verified',
            'date_joined',
            'solved_challenges',
            'last_login',
        ]
        read_only_fields = [
            'username',
            'id',
            'points',
            'team',
            'is_email_verified',
            'solved_challenges',
            'last_login',
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


class UserChallengeSessionCreateRetrieveDestroySerializer(serializers.ModelSerializer):

    class Meta:
        model = UserChallengeSession
        fields = [
            # 'id',
            'user',
            'challenge',
            'address',
        ]
        read_only_fields = [
            'user',
            # 'challenge',
            'address',
        ]

    def create(self, validated_data):
        # user_challenge_session_id = validated_data.get('user_challenge_session_id')
        user = self.context['request'].user
        print(validated_data)
        validated_data.update(
            {
                'user': user
            }
        )

        print(validated_data)
        instance = UserChallengeSession.objects.create(**validated_data)
        # for k in instance:
        #     print(instance.k)
        print(str(instance))

        # raise serializers.ValidationError("Stop.")
        return instance

class FlagSubmissionSerializer(serializers.ModelSerializer):
    # UserChallengeSession没有这俩field
    user_flag = serializers.CharField(max_length=100, write_only=True)
    # user_challenge_session_id = serializers.IntegerField()

    class Meta:
        model = UserChallengeSession
        fields = [
            # 'user_challenge_session_id',
            'user_flag',
        ]

    def create(self, validated_data):
        # user_challenge_session_id = validated_data.get('user_challenge_session_id')
        user = self.context['request'].user
        user_flag = validated_data.get('user_flag')
        try:
            user_challenge_session = UserChallengeSession.objects.filter(user=user, is_solved=False).last()
        except UserChallengeSession.DoesNotExist:
            raise serializers.ValidationError(
                detail={"detail": "You don't have any open session."},
                code=status.HTTP_400_BAD_REQUEST
            )

        # if user_challenge_session.is_solved:
        #     raise serializers.ValidationError(
        #         detail={"detail": "Challenge is solved. Session is closed."},
        #         code=status.HTTP_400_BAD_REQUEST
        #     )

        is_expired = user_challenge_session.expiration_verification()
        if is_expired:
            raise serializers.ValidationError({"detail": "Time limit exceeded. Session is closed."}, code=status.HTTP_400_BAD_REQUEST)

        is_correct = user_challenge_session.flag_verification(user_flag)
        if not is_correct:
            raise serializers.ValidationError({"detail": "Incorrect answer."}, code=status.HTTP_400_BAD_REQUEST)

        # session = UserChallengeSession.objects.get(id=user_challenge_session_id)
        # session.is_solved_or_expired = True
        # session.save()
        return user_challenge_session


class UserInfoPrivate(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'description',
        ]

