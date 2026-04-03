from django.db.models import Sum
from records.models import Expenses, Income


def get_summary(user):
    total_income = Income.objects.filter(
        user=user
    ).aggregate(Sum('amount'))['amount__sum'] or 0

    total_expense = Expenses.objects.filter(
        user=user
    ).aggregate(Sum('amount'))['amount__sum'] or 0

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_balance": total_income - total_expense,
    }
