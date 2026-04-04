from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.core.cache import cache

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

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
    cache_key = f'summary_{user.pk}'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    income = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    expense = Expenses.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
    result = {
        'total_income': income,
        'total_expense': expense,
        'balance': income - expense,
    }
    cache.set(cache_key, result, timeout=60)
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAnalystOrAdmin])
def insights(request):
    expenses_by_category = (
        Expenses.objects.filter(user=request.user)
        .values('categories__title')
        .annotate(total=Sum('amount'))
    )
    return Response({'category_breakdown': list(expenses_by_category)})


@api_view(['GET'])
@permission_classes([IsAnalystOrAdmin])
def monthly_trends(request):
    data = (
        Expenses.objects
        .filter(user=request.user)
        .annotate(month=TruncMonth('added_at'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )
    return Response(list(data))
