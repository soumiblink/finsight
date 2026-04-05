from rest_framework.permissions import BasePermission, SAFE_METHODS


def _authenticated(request):
    return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    
    def has_permission(self, request, view):
        return _authenticated(request) and request.user.role == 'admin'


class IsAnalystOrAdmin(BasePermission):
    
    def has_permission(self, request, view):
        return _authenticated(request) and request.user.role in ('analyst', 'admin')


class IsViewerOrAbove(BasePermission):
    
    def has_permission(self, request, view):
        return _authenticated(request)


class ReadOnlyForViewer(BasePermission):
    
    def has_permission(self, request, view):
        if not _authenticated(request):
            return False
        if request.user.role in ('analyst', 'admin'):
            return True
        # viewer gets read-only
        return request.method in SAFE_METHODS
