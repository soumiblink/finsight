from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from core.permissions import IsAdmin
from .serializers import (
    RegisterSerializer, LoginSerializer,
    UserSerializer, UpdateRoleSerializer, UpdateStatusSerializer,
)

User = get_user_model()


# ── Auth ──────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response({
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )

    if not user:
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({"error": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)
    return Response({
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }, status=status.HTTP_200_OK)


# ── Current user ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ── Admin ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_users(request):
    users = User.objects.only('id', 'username', 'email', 'role', 'is_active').all()
    return Response(UserSerializer(users, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_role(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateRoleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.role = serializer.validated_data['role']
    user.save(update_fields=['role'])
    return Response({"message": "Role updated.", "user": UserSerializer(user).data})


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_status(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = serializer.validated_data['is_active']
    user.save(update_fields=['is_active'])
    return Response({"message": "Status updated.", "user": UserSerializer(user).data})
