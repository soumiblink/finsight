from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum

from core.permissions import IsAnalystOrAdmin
from records.models import Expenses, Income
from .services import get_summary


class SummaryView(APIView):
    permission_classes = [IsAnalystOrAdmin]

    def get(self, request):
        return Response(get_summary(request.user))


@api_view(['GET'])
@permission_classes([IsAnalystOrAdmin])
def summary(request):
    user = request.user
    income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    expense = Expenses.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        "total_income": income,
        "total_expense": expense,
        "balance": income - expense
    })


@api_view(['GET'])
@permission_classes([IsAnalystOrAdmin])
def insights(request):
    user = request.user
    expenses_by_category = (
        Expenses.objects.filter(user=user)
        .values('categories__title')
        .annotate(total=Sum('amount'))
    )

    return Response({
        "category_breakdown": list(expenses_by_category)
    })
