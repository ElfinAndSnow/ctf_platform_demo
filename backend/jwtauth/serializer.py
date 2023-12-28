from rest_framework import serializers, status
from account.models import User
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

from jwtauth.models import EmailVerification
from utils.email_verification import code_generate


class CodeVerificationSerializer(serializers.ModelSerializer):
    verify_code = serializers.CharField()
    verify_purpose = serializers.CharField()

    class Meta:
        model = EmailVerification
        fields = [
            'verify_code',
            'verify_purpose',
        ]

    def create(self, validated_data):
        verify_code = validated_data.get('verify_code')
        verify_purpose = validated_data.get('verify_purpose')

        is_activated = self.context['request'].user.is_email_verified
        if is_activated and verify_purpose == "registration":
            raise serializers.ValidationError(
                {"detail": "You have already activated your account."},
                code=status.HTTP_400_BAD_REQUEST
            )

        if (not is_activated) and verify_purpose == "password_reset":
            raise serializers.ValidationError(
                {"detail": "Please activate your account."},
                code=status.HTTP_400_BAD_REQUEST
            )

        try:
            instance = EmailVerification.objects.get(
                code=verify_code,
                purpose=verify_purpose,
                is_verified=False,
                is_expired=False
            )
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Invalid code."},
                code=status.HTTP_400_BAD_REQUEST
            )

        # if instance.purpose != verify_purpose:
        #     raise serializers.ValidationError(
        #         {"detail": "Invalid purpose."},
        #         code=status.HTTP_400_BAD_REQUEST
        #     )

        is_expired = instance.expiration_verification()
        if is_expired:
            raise serializers.ValidationError(
                {"detail": "This code is no longer valid."},
                code=status.HTTP_400_BAD_REQUEST
            )

        is_correct = instance.code_verification(verify_code)
        if not is_correct:
            raise serializers.ValidationError(
                {"detail": "Invalid code."},
                code=status.HTTP_400_BAD_REQUEST
            )

        return instance


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


class PasswordResetSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    verify_code = CodeVerificationSerializer(write_only=True)

    class Meta:
        model = User
        fields = [
            'current_password',
            'new_password',
            'confirm_new_password',
            'verify_code',
        ]

    def validate(self, attrs):
        print("attrs:")
        print(attrs)
        user = self.context['request'].user

        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError("Current password is incorrect.")

        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError("New passwords do not match.")

        print(attrs)
        # attrs.pop('verify_code')
        # print(attrs)
        return attrs

    # In view, get_serializer pass an instance to this update method
    def update(self, instance, validated_data):
        print(self.context['request'].user)
        print("verify create")
        verify_data = validated_data.pop('verify_code')
        CodeVerificationSerializer.create(self, verify_data)
        print("in update")
        instance.set_password(validated_data['new_password'])
        print(instance)
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
