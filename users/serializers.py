from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

VALID_ROLES = ('viewer', 'analyst', 'admin')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']

    def validate_username(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Username must not be blank.")
        if User.objects.filter(username__iexact=value.strip()).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value.strip()

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        return value

    def validate_role(self, value):
        if value and value not in VALID_ROLES:
            raise serializers.ValidationError(f"Role must be one of: {', '.join(VALID_ROLES)}.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'viewer'),
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate_username(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Username is required.")
        return value.strip()

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password is required.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """Full read serializer — used in list / me endpoints."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active']


class UpdateRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=VALID_ROLES)


class UpdateStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()
