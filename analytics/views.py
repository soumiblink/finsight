from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.core.cache import cache

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAnalystOrAdmin, IsViewerOrAbove
from records.models import Expenses, Income
from .services import get_summary


# ── Existing views (unchanged) ────────────────────────────────────────────────

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


@api_view(['GET'])
@permission_classes([IsViewerOrAbove])
def recent_activity(request):
    limit = int(request.query_params.get('limit', 10))

    recent_income = (
        Income.objects
        .filter(user=request.user)
        .values('id', 'title', 'amount', 'desc', 'added_at')
        .order_by('-added_at')[:limit]
    )

    recent_expenses = (
        Expenses.objects
        .filter(user=request.user)
        .values('id', 'title', 'amount', 'desc', 'added_at')
        .order_by('-added_at')[:limit]
    )

    income_list = [{'record_type': 'income', **r} for r in recent_income]
    expense_list = [{'record_type': 'expense', **r} for r in recent_expenses]

    combined = sorted(
        income_list + expense_list,
        key=lambda r: r['added_at'],
        reverse=True,
    )[:limit]

    return Response(combined)


# ── NEW: /api/analytics/dashboard/ ───────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAnalystOrAdmin])
def dashboard(request):
    """
    Aggregated dashboard payload.

    Returns:
        monthly_trends    — income + expense totals grouped by month
        category_breakdown — expense totals per category
        recent_activity   — last 5 records (income + expense combined)
    """
    user = request.user

    # 1. Monthly trends — income and expense side by side
    income_by_month = (
        Income.objects
        .filter(user=user)
        .annotate(month=TruncMonth('added_at'))
        .values('month')
        .annotate(income=Sum('amount'))
        .order_by('month')
    )
    expense_by_month = (
        Expenses.objects
        .filter(user=user)
        .annotate(month=TruncMonth('added_at'))
        .values('month')
        .annotate(expense=Sum('amount'))
        .order_by('month')
    )

    # Merge into a single list keyed by month string
    trends_map = {}
    for row in income_by_month:
        key = row['month'].strftime('%b %Y') if row['month'] else '—'
        trends_map.setdefault(key, {'month': key, 'income': 0, 'expense': 0})
        trends_map[key]['income'] = round(row['income'] or 0, 2)
    for row in expense_by_month:
        key = row['month'].strftime('%b %Y') if row['month'] else '—'
        trends_map.setdefault(key, {'month': key, 'income': 0, 'expense': 0})
        trends_map[key]['expense'] = round(row['expense'] or 0, 2)

    monthly_trends_list = sorted(trends_map.values(), key=lambda r: r['month'])

    # 2. Category breakdown
    category_breakdown = list(
        Expenses.objects
        .filter(user=user)
        .values('categories__title')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )
    category_breakdown = [
        {
            'category': row['categories__title'] or 'Uncategorized',
            'total': round(row['total'] or 0, 2),
        }
        for row in category_breakdown
    ]

    # 3. Recent activity — last 5 across income + expense
    recent_income = list(
        Income.objects
        .filter(user=user)
        .values('id', 'amount', 'added_at')
        .order_by('-added_at')[:5]
    )
    recent_expenses = list(
        Expenses.objects
        .filter(user=user)
        .values('id', 'amount', 'added_at')
        .order_by('-added_at')[:5]
    )

    income_activity = [
        {
            'id': r['id'],
            'amount': round(r['amount'] or 0, 2),
            'type': 'income',
            'date': r['added_at'].strftime('%Y-%m-%d') if r['added_at'] else None,
        }
        for r in recent_income
    ]
    expense_activity = [
        {
            'id': r['id'],
            'amount': round(r['amount'] or 0, 2),
            'type': 'expense',
            'date': r['added_at'].strftime('%Y-%m-%d') if r['added_at'] else None,
        }
        for r in recent_expenses
    ]

    recent_activity_list = sorted(
        income_activity + expense_activity,
        key=lambda r: r['date'] or '',
        reverse=True,
    )[:5]

    return Response({
        'monthly_trends': monthly_trends_list,
        'category_breakdown': category_breakdown,
        'recent_activity': recent_activity_list,
    })
