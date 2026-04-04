from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from core.permissions import IsViewerOrAbove, IsAdmin
from .models import Budget
from .serializers import BudgetSerializer


@api_view(['GET', 'POST'])
def budgets(request: Request) -> Response:

    if request.method == 'GET':
        if not IsViewerOrAbove().has_permission(request, None):
            return _forbidden()
        qs = Budget.objects.filter(user=request.user)
        return Response(BudgetSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        if not IsAdmin().has_permission(request, None):
            return _forbidden()
        data = request.data.copy()
        data['user'] = request.user.pk
        serializer = BudgetSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdmin])
def budget_detail(request: Request, pk: int) -> Response:

    budget = Budget.objects.filter(pk=pk, user=request.user).first()
    if not budget:
        return Response({'error': 'Budget not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        data = request.data.copy()
        data['user'] = request.user.pk
        serializer = BudgetSerializer(budget, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _forbidden():
    return Response(
        {'error': 'You do not have permission to perform this action.'},
        status=status.HTTP_403_FORBIDDEN,
    )
