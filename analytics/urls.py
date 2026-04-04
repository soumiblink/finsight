from django.urls import path
from .views import summary, insights, monthly_trends, recent_activity

urlpatterns = [
    path('summary/', summary),
    path('insights/', insights),
    path('monthly-trends/', monthly_trends),
    path('recent/', recent_activity),
]
