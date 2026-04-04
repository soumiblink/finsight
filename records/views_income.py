from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, APIException

from core.permissions import IsViewerOrAbove, IsAdmin
from .serializers import CreateIncomeSerializer, IncomeSerializer, SourceSerializer
from .models import Income, Source


@api_view(['GET', 'POST'])
def sources(request: Request) -> Response:

    if request.method == 'GET':
        if not IsViewerOrAbove().has_permission(request, None):
            return _forbidden()
        qs = Source.objects.filter(user=request.user)
        return Response(SourceSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        if not IsAdmin().has_permission(request, None):
            return _forbidden()
        data = request.data.copy()
        data['user'] = request.user.pk
        serializer = SourceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdmin])
def update_sources(request: Request, pk: int) -> Response:
    user = request.user.pk

    if request.method == 'PUT':
        source = Source.objects.filter(pk=pk, user=user).first()
        if not source:
            raise NotFound('Source not found')
        serializer = SourceSerializer(source, data={**request.data, 'user': user})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        qs = Source.objects.filter(user=user, pk=pk)
        if not qs.exists():
            raise NotFound('Source not found')
        qs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def income(request: Request) -> Response:

    if request.method == 'GET':
        if not IsViewerOrAbove().has_permission(request, None):
            return _forbidden()
        qs = Income.objects.filter(user=request.user)
        return Response(IncomeSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        if not IsAdmin().has_permission(request, None):
            return _forbidden()
        data = {**request.data, 'user': request.user.pk}
        serializer = CreateIncomeSerializer(data=data)
        if serializer.is_valid():
            return Response(
                IncomeSerializer(serializer.save()).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdmin])
def update_income(request: Request, pk: int) -> Response:

    if request.method == 'PUT':
        income_obj = Income.objects.filter(user=request.user.pk, pk=pk).first()
        if not income_obj:
            raise APIException('Income not found', code=status.HTTP_404_NOT_FOUND)
        serializer = CreateIncomeSerializer(income_obj, data={**request.data, 'user': request.user.pk})
        if serializer.is_valid():
            return Response(IncomeSerializer(serializer.save()).data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        income_obj = Income.objects.filter(user=request.user.pk, pk=pk).first()
        if not income_obj:
            raise NotFound('Income not found')
        income_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _forbidden():
    return Response(
        {'error': 'You do not have permission to perform this action.'},
        status=status.HTTP_403_FORBIDDEN,
    )
