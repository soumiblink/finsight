from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

VALID_ROLES = ('viewer', 'analyst', 'admin')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'viewer'),
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """Full read serializer — used in list / me endpoints."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active']


class UpdateRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=VALID_ROLES)


class UpdateStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()
