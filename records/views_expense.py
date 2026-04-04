from typing import Optional

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view, permission_classes, parser_classes

from core.permissions import IsViewerOrAbove, IsAdmin
from .models import Expenses, Category
from .serializers import (
    ExpenseSerializer, CategorySerializer,
    CreateExpenseSerializer, UpdateExpenseSerializer,
)


@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def expenses(request: Request) -> Optional[Response]:

    if request.method == 'GET':
        permission = IsViewerOrAbove()
        if not permission.has_permission(request, None):
            return _forbidden()
        qs = Expenses.objects.filter(user=request.user)
        return Response(ExpenseSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        permission = IsAdmin()
        if not permission.has_permission(request, None):
            return _forbidden()
        data = request.data.copy()
        data['user'] = request.user.pk
        serializer = CreateExpenseSerializer(data=data)
        if serializer.is_valid():
            return Response(ExpenseSerializer(serializer.save()).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAdmin])
def upgrade_expense(request: Request, pk: int) -> Optional[Response]:
    user = request.user.pk

    if request.method == 'PUT':
        expense = Expenses.objects.filter(user=user, pk=pk).first()
        if not expense:
            raise NotFound(f'ExpenseId {pk} not found')
        data = request.data.copy()
        data['user'] = user
        serializer = UpdateExpenseSerializer(expense, data=data)
        if serializer.is_valid():
            return Response(ExpenseSerializer(serializer.save()).data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        expense = Expenses.objects.filter(user=user, pk=pk).first()
        if not expense:
            raise NotFound('Could not find this expense')
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def categories(request: Request) -> Response:

    if request.method == 'GET':
        permission = IsViewerOrAbove()
        if not permission.has_permission(request, None):
            return _forbidden()
        qs = Category.objects.filter(user=request.user)
        return Response(CategorySerializer(qs, many=True).data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        permission = IsAdmin()
        if not permission.has_permission(request, None):
            return _forbidden()
        data = request.data.copy()
        data['user'] = request.user.pk
        serializer = CategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdmin])
def upgrade_categories(request: Request, pk: int) -> Optional[Response]:
    user = request.user.pk

    if request.method == 'PUT':
        data = {**request.data, 'user': user}
        try:
            category = Category.objects.get(pk=pk, user=user)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        qs = Category.objects.filter(user=user, pk=pk)
        if not qs.exists():
            raise NotFound('Category not found')
        qs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _forbidden():
    from rest_framework.response import Response
    return Response(
        {'error': 'You do not have permission to perform this action.'},
        status=status.HTTP_403_FORBIDDEN,
    )
