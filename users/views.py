from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    if not user.is_active:
        return Response({"error": "Account is disabled"}, status=403)

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    })


# ── Current user ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ── Admin: user management ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_users(request):
    return Response(UserSerializer(User.objects.all(), many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_role(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    serializer = UpdateRoleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    user.role = serializer.validated_data['role']
    user.save()
    return Response({"message": "Role updated", "user": UserSerializer(user).data})


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_status(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    serializer = UpdateStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    user.is_active = serializer.validated_data['is_active']
    user.save()
    return Response({"message": "Status updated", "user": UserSerializer(user).data})
