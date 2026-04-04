from django.utils import timezone
from django.db.models import Sum

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, api_view
from rest_framework.viewsets import ModelViewSet

from core.permissions import IsViewerOrAbove, IsAdmin
from .models import Income, Expenses
from .serializers import ExpenseSerializer, CreateExpenseSerializer


class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsViewerOrAbove()]
        return [IsAdmin()]

    def get_queryset(self):
        queryset = Expenses.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        queryset = queryset.filter(user=user)

        category = self.request.query_params.get('category')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering')

        if category:
            queryset = queryset.filter(categories__title__icontains=category)
        if start_date:
            queryset = queryset.filter(added_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(added_at__date__lte=end_date)
        if search:
            queryset = queryset.filter(desc__icontains=search)
        if ordering:
            try:
                queryset = queryset.order_by(ordering)
            except Exception:
                pass

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateExpenseSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsViewerOrAbove])
def base_information(request: Request) -> Response:
    user = request.user
    current_month = timezone.now().month

    total_income = Income.objects.filter(user=user).aggregate(Sum('amount')).get('amount__sum') or 0
    total_expense = Expenses.objects.filter(user=user).aggregate(Sum('amount')).get('amount__sum') or 0
    monthly_income = Income.objects.filter(user=user, added_at__month=current_month).aggregate(Sum('amount')).get('amount__sum') or 0
    monthly_expense = Expenses.objects.filter(user=user, added_at__month=current_month).aggregate(Sum('amount')).get('amount__sum') or 0

    return Response({
        'total_income': total_income,
        'monthly_income': monthly_income,
        'total_expense': total_expense,
        'monthly_expense': monthly_expense,
    }, status=status.HTTP_200_OK)
