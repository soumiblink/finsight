from django.urls import path
from .views import register, login, get_users, update_role, update_status

urlpatterns = [
    path('auth/register/', register),
    path('auth/login/', login),

    path('', get_users),
    path('<int:pk>/role/', update_role),
    path('<int:pk>/status/', update_status),
]
