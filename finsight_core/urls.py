from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        "name": "FinSight API",
        "version": "1.0",
        "status": "running",
        "endpoints": {
            "auth":      "/api/users/auth/",
            "records":   "/api/records/",
            "analytics": "/api/analytics/",
            "admin":     "/admin/",
        }
    })


urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/records/', include('records.urls')),
    path('api/analytics/', include('analytics.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = "FinSight Backend"
