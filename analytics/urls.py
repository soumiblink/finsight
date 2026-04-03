from django.urls import path
from .views import summary, insights

urlpatterns = [
    path('summary/', summary),
    path('insights/', insights),
]
