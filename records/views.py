from django.utils import timezone
from django.db.models import Sum

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, api_view
from rest_framework.viewsets import ModelViewSet

from .models import Income, Expenses
from .serializers import ExpenseSerializer, CreateExpenseSerializer
from core.permissions import IsAdmin, IsAnalystOrAdmin


class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAnalystOrAdmin()]

    def get_queryset(self):
        return Expenses.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateExpenseSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(http_method_names=['GET'])
@permission_classes([IsAuthenticated])
def base_information(request: Request) -> Response:
    user = request.user
    current_month = timezone.now().month

    total_income = Income.objects.filter(
        user=user
    ).aggregate(Sum('amount')).get('amount__sum') or 0
    total_expense = Expenses.objects.filter(
        user=user
    ).aggregate(Sum('amount')).get('amount__sum') or 0
    monthly_income = Income.objects.filter(
        user=user,
        added_at__month=current_month
    ).aggregate(Sum('amount')).get('amount__sum') or 0
    monthly_expense = Expenses.objects.filter(
        user=user,
        added_at__month=current_month
    ).aggregate(Sum('amount')).get('amount__sum') or 0

    return Response({
        'total_income': total_income,
        'monthly_income': monthly_income,
        'total_expense': total_expense,
        'monthly_expense': monthly_expense
    }, status=status.HTTP_200_OK)
