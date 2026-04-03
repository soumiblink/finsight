from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from core.permissions import IsAdmin

User = get_user_model()


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

    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            })

        return Response({"error": "Invalid credentials"}, status=401)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_users(request):
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_role(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    role = request.data.get('role')
    if role not in ['viewer', 'analyst', 'admin']:
        return Response({"error": "Invalid role"}, status=400)

    user.role = role
    user.save()
    return Response({"message": "Role updated"})


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_status(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    is_active = request.data.get('is_active')
    user.is_active = is_active
    user.save()

    return Response({"message": "User status updated"})
