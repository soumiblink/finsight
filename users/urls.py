from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, login, me, get_users, update_role, update_status

urlpatterns = [
   
    path('auth/register/', register),
    path('auth/login/', login),
    path('auth/token/refresh/', TokenRefreshView.as_view()),

    # Current user
    path('me/', me),

    # Admin 
    path('', get_users),
    path('<int:pk>/role/', update_role),
    path('<int:pk>/status/', update_status),
]
