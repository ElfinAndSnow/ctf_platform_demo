from rest_framework import serializers
from account.models import User
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password


class RegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(queryset=User.objects.all())
        ]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'confirm_password',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Please input same password!"})

        return attrs

    def create(self, validated_data):
        instance = User(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        instance.set_password(validated_data['password'])
        instance.save()
        return instance


class PasswordUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_new_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'current_password',
            'new_password',
            'confirm_new_password',
        ]

    def validate(self, data):
        user = self.context['request'].user

        # Check if the current password is correct
        if not user.check_password(data['current_password']):
            raise serializers.ValidationError("Current password is incorrect.")

        # Check if the new password and confirm new password match
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError("New passwords do not match.")

        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance


class EmailVerificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = [
            # 由于视图已经做权限过滤，user可从request提取
            # 'user',
            'purpose',
            # code should be automatically generated while creating
            # 'code',
        ]

    def validate(self, attrs):
        user = self.context['request'].user

        # print(attrs['user'])
        # print(str(user.id))
        # if user != attrs['user']:
        #     raise serializers.ValidationError(
        #         detail={"detail": "You can only create verification for yourself."},
        #         code=status.HTTP_400_BAD_REQUEST
        #     )
        for instance in user.email_verifications.all():
            if instance.is_verified or instance.is_expired:
                continue
            is_expired = instance.expiration_verification()
            if not is_expired:
                raise serializers.ValidationError(
                    detail={"detail": "Please wait for your last verification code expires."},
                    code=status.HTTP_400_BAD_REQUEST
                )

        # print(attrs)
        # attrs.update(user)
        # print(attrs)

        return attrs

    def create(self, validated_data):
        print(validated_data)
        validated_data.update(
            {"user": self.context['request'].user}
        )
        print(validated_data)
        instance = super().create(validated_data)
        # generate code
        instance.code = code_generate()
        instance.save()
        return instance
